import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InvitationsService } from './invitations.service';
import { PrismaService } from '../database/prisma.service';
import { MailService } from '../mail/mail.service';
import { User, Organization, Language } from '@prisma/client';

describe('InvitationsService', () => {
  let service: InvitationsService;

  const mockPrismaService = {
    invitation: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    organizationMember: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockMailService = {
    sendInvitationEmail: jest.fn(),
  };

  const mockUser: User = {
    id: 'user-123',
    email: 'inviter@example.com',
    firstName: 'Inviter',
    lastName: 'User',
    emailVerified: true,
    avatarUrl: null,
    language: 'en' as Language,
    theme: 'system',
    isSuperAdmin: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockOrganization: Organization = {
    id: 'org-123',
    name: 'Test Org',
    slug: 'test-org',
    stripeCustomerId: null,
    subscriptionTier: 'free',
    subscriptionStatus: 'active',
    trialEndsAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvitationsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: MailService,
          useValue: mockMailService,
        },
      ],
    }).compile();

    service = module.get<InvitationsService>(InvitationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create invitation and send email', async () => {
      const invitationDto = { email: 'newuser@example.com', role: 'member' as const };
      const createdInvitation = {
        id: 'invitation-123',
        email: 'newuser@example.com',
        role: 'member',
        token: expect.any(String),
        organizationId: 'org-123',
        invitedById: 'user-123',
        status: 'pending',
        expiresAt: expect.any(Date),
        organization: mockOrganization,
      };

      mockPrismaService.organizationMember.findFirst.mockResolvedValue(null);
      mockPrismaService.invitation.findFirst.mockResolvedValue(null);
      mockPrismaService.invitation.create.mockResolvedValue(createdInvitation);
      mockMailService.sendInvitationEmail.mockResolvedValue(undefined);

      const result = await service.create(invitationDto, mockOrganization, mockUser);

      expect(result).toMatchObject({
        email: 'newuser@example.com',
        role: 'member',
        organization: mockOrganization,
      });
      expect(mockMailService.sendInvitationEmail).toHaveBeenCalledWith(
        'newuser@example.com',
        expect.any(String),
        'Test Org',
        'member',
        'en',
      );
    });

    it('should throw ConflictException if email is already a member', async () => {
      const invitationDto = { email: 'existing@example.com', role: 'member' as const };

      mockPrismaService.organizationMember.findFirst.mockResolvedValue({
        id: 'membership-123',
        userId: 'existing-user',
        organizationId: 'org-123',
      });

      await expect(service.create(invitationDto, mockOrganization, mockUser)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.create(invitationDto, mockOrganization, mockUser)).rejects.toThrow(
        'User is already a member of this organization',
      );
    });

    it('should throw ConflictException if pending invitation exists', async () => {
      const invitationDto = { email: 'pending@example.com', role: 'member' as const };

      mockPrismaService.organizationMember.findFirst.mockResolvedValue(null);
      mockPrismaService.invitation.findFirst.mockResolvedValue({
        id: 'invitation-123',
        email: 'pending@example.com',
        status: 'pending',
      });

      await expect(service.create(invitationDto, mockOrganization, mockUser)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.create(invitationDto, mockOrganization, mockUser)).rejects.toThrow(
        'An invitation has already been sent to this email',
      );
    });
  });

  describe('getOrganizationInvitations', () => {
    it('should return list of pending invitations', async () => {
      const mockInvitations = [
        {
          id: 'invitation-1',
          email: 'user1@example.com',
          role: 'member',
          status: 'pending',
          expiresAt: new Date(Date.now() + 86400000),
        },
        {
          id: 'invitation-2',
          email: 'user2@example.com',
          role: 'admin',
          status: 'pending',
          expiresAt: new Date(Date.now() + 86400000),
        },
      ];

      mockPrismaService.invitation.findMany.mockResolvedValue(mockInvitations);

      const result = await service.getOrganizationInvitations('org-123');

      expect(result).toEqual(mockInvitations);
      expect(mockPrismaService.invitation.findMany).toHaveBeenCalledWith({
        where: {
          organizationId: 'org-123',
          status: 'pending',
        },
        orderBy: {
          expiresAt: 'asc',
        },
      });
    });
  });

  describe('cancelInvitation', () => {
    it('should cancel pending invitation', async () => {
      const mockInvitation = {
        id: 'invitation-123',
        organizationId: 'org-123',
        status: 'pending',
      };

      mockPrismaService.invitation.findUnique.mockResolvedValue(mockInvitation);
      mockPrismaService.invitation.update.mockResolvedValue({
        ...mockInvitation,
        status: 'canceled',
      });

      const result = await service.cancelInvitation('invitation-123', 'org-123');

      expect(result.status).toBe('canceled');
      expect(mockPrismaService.invitation.update).toHaveBeenCalledWith({
        where: { id: 'invitation-123' },
        data: { status: 'canceled' },
      });
    });

    it('should throw NotFoundException if invitation not found', async () => {
      mockPrismaService.invitation.findUnique.mockResolvedValue(null);

      await expect(service.cancelInvitation('non-existent', 'org-123')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if invitation belongs to different org', async () => {
      mockPrismaService.invitation.findUnique.mockResolvedValue({
        id: 'invitation-123',
        organizationId: 'different-org',
        status: 'pending',
      });

      await expect(service.cancelInvitation('invitation-123', 'org-123')).rejects.toThrow(
        ForbiddenException,
      );
      await expect(service.cancelInvitation('invitation-123', 'org-123')).rejects.toThrow(
        'Invitation does not belong to this organization',
      );
    });

    it('should throw BadRequestException if invitation is not pending', async () => {
      mockPrismaService.invitation.findUnique.mockResolvedValue({
        id: 'invitation-123',
        organizationId: 'org-123',
        status: 'accepted',
      });

      await expect(service.cancelInvitation('invitation-123', 'org-123')).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.cancelInvitation('invitation-123', 'org-123')).rejects.toThrow(
        'Invitation is no longer pending',
      );
    });
  });

  describe('getByToken', () => {
    it('should return invitation details by token', async () => {
      const mockInvitation = {
        id: 'invitation-123',
        email: 'user@example.com',
        role: 'member',
        token: 'valid-token',
        status: 'pending',
        expiresAt: new Date(Date.now() + 86400000),
        organization: {
          id: 'org-123',
          name: 'Test Org',
          slug: 'test-org',
        },
      };

      mockPrismaService.invitation.findUnique.mockResolvedValue(mockInvitation);

      const result = await service.getByToken('valid-token');

      expect(result).toEqual({
        id: 'invitation-123',
        email: 'user@example.com',
        role: 'member',
        organization: mockInvitation.organization,
        expiresAt: mockInvitation.expiresAt,
      });
    });

    it('should throw NotFoundException if token not found', async () => {
      mockPrismaService.invitation.findUnique.mockResolvedValue(null);

      await expect(service.getByToken('invalid-token')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if invitation is not pending', async () => {
      mockPrismaService.invitation.findUnique.mockResolvedValue({
        id: 'invitation-123',
        status: 'accepted',
        expiresAt: new Date(Date.now() + 86400000),
      });

      await expect(service.getByToken('token')).rejects.toThrow(BadRequestException);
      await expect(service.getByToken('token')).rejects.toThrow('Invitation is accepted');
    });

    it('should throw BadRequestException and update status if invitation is expired', async () => {
      const expiredInvitation = {
        id: 'invitation-123',
        status: 'pending',
        expiresAt: new Date(Date.now() - 86400000),
        organization: { id: 'org-123', name: 'Test', slug: 'test' },
      };

      mockPrismaService.invitation.findUnique.mockResolvedValue(expiredInvitation);

      await expect(service.getByToken('token')).rejects.toThrow(BadRequestException);
      await expect(service.getByToken('token')).rejects.toThrow('Invitation has expired');
      expect(mockPrismaService.invitation.update).toHaveBeenCalledWith({
        where: { id: 'invitation-123' },
        data: { status: 'expired' },
      });
    });
  });

  describe('accept', () => {
    const acceptingUser: User = {
      id: 'accepting-user-123',
      email: 'invited@example.com',
      firstName: 'Invited',
      lastName: 'User',
      emailVerified: true,
      avatarUrl: null,
      language: 'en' as Language,
      theme: 'system',
      isSuperAdmin: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should accept invitation and create membership', async () => {
      const mockInvitation = {
        id: 'invitation-123',
        email: 'invited@example.com',
        role: 'member',
        token: 'valid-token',
        status: 'pending',
        organizationId: 'org-123',
        expiresAt: new Date(Date.now() + 86400000),
        organization: mockOrganization,
      };

      const createdMembership = {
        id: 'membership-123',
        userId: 'accepting-user-123',
        organizationId: 'org-123',
        role: 'member',
        organization: mockOrganization,
      };

      mockPrismaService.invitation.findUnique.mockResolvedValue(mockInvitation);
      mockPrismaService.organizationMember.findUnique.mockResolvedValue(null);
      mockPrismaService.$transaction.mockResolvedValue([
        createdMembership,
        { ...mockInvitation, status: 'accepted' },
      ]);

      const result = await service.accept('valid-token', acceptingUser);

      expect(result).toEqual({
        organization: mockOrganization,
        role: 'member',
      });
    });

    it('should throw NotFoundException if invitation not found', async () => {
      mockPrismaService.invitation.findUnique.mockResolvedValue(null);

      await expect(service.accept('invalid-token', acceptingUser)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if invitation is not pending', async () => {
      mockPrismaService.invitation.findUnique.mockResolvedValue({
        id: 'invitation-123',
        status: 'canceled',
        expiresAt: new Date(Date.now() + 86400000),
        organization: mockOrganization,
      });

      await expect(service.accept('token', acceptingUser)).rejects.toThrow(BadRequestException);
      await expect(service.accept('token', acceptingUser)).rejects.toThrow(
        'Invitation is canceled',
      );
    });

    it('should throw BadRequestException if invitation is expired', async () => {
      mockPrismaService.invitation.findUnique.mockResolvedValue({
        id: 'invitation-123',
        status: 'pending',
        expiresAt: new Date(Date.now() - 86400000),
        organization: mockOrganization,
      });

      await expect(service.accept('token', acceptingUser)).rejects.toThrow(BadRequestException);
      await expect(service.accept('token', acceptingUser)).rejects.toThrow(
        'Invitation has expired',
      );
    });

    it('should throw ForbiddenException if email does not match', async () => {
      const wrongUser: User = {
        ...acceptingUser,
        email: 'wrong@example.com',
      };

      mockPrismaService.invitation.findUnique.mockResolvedValue({
        id: 'invitation-123',
        email: 'invited@example.com',
        status: 'pending',
        expiresAt: new Date(Date.now() + 86400000),
        organization: mockOrganization,
      });

      await expect(service.accept('token', wrongUser)).rejects.toThrow(ForbiddenException);
      await expect(service.accept('token', wrongUser)).rejects.toThrow(
        'This invitation was sent to a different email address',
      );
    });

    it('should throw ConflictException if user is already a member', async () => {
      mockPrismaService.invitation.findUnique.mockResolvedValue({
        id: 'invitation-123',
        email: 'invited@example.com',
        status: 'pending',
        organizationId: 'org-123',
        expiresAt: new Date(Date.now() + 86400000),
        organization: mockOrganization,
      });

      mockPrismaService.organizationMember.findUnique.mockResolvedValue({
        id: 'existing-membership',
        userId: 'accepting-user-123',
        organizationId: 'org-123',
      });

      await expect(service.accept('token', acceptingUser)).rejects.toThrow(ConflictException);
      await expect(service.accept('token', acceptingUser)).rejects.toThrow(
        'You are already a member of this organization',
      );
    });
  });
});
