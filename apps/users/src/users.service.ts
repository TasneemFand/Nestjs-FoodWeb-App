import { BadRequestException, Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/user.dto';
import { Response } from 'express';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  // register user service
  async register(registerDto: RegisterDto, response: Response) {
    const { name, email, password, phone_number } = registerDto;

    const isEmailExist = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (isEmailExist) {
      throw new BadRequestException('User already exist with this email!');
    }

    const phoneNumbersToCheck = [phone_number];

    const usersWithPhoneNumber = await this.prisma.user.findMany({
      where: {
        phone_number: {
          not: null,
          in: phoneNumbersToCheck,
        },
      },
    });

    if (usersWithPhoneNumber.length > 0) {
      throw new BadRequestException(
        'User already exist with this phone number!',
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone_number,
      },
    });

    return { user, response };
  }
}
