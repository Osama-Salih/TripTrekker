import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendPasswordRest(user: User, resetCode: string) {
    await this.mailerService.sendMail({
      to: user.email,
      subject: `${user.username}, here's your PIN ${resetCode} (valid 10 minutes)`,
      template: './confirmation',
      context: {
        name: user.username,
        resetCode,
      },
    });
  }
}
