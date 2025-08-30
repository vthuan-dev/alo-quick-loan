import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Mật khẩu hiện tại',
    example: 'currentPassword123',
  })
  @IsString()
  @IsNotEmpty({ message: 'Mật khẩu hiện tại không được để trống' })
  currentPassword: string;

  @ApiProperty({
    description: 'Mật khẩu mới',
    example: 'newPassword123',
    minLength: 6,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty({ message: 'Mật khẩu mới không được để trống' })
  @MinLength(6, { message: 'Mật khẩu mới phải có ít nhất 6 ký tự' })
  @MaxLength(50, { message: 'Mật khẩu mới không được quá 50 ký tự' })
  newPassword: string;

  @ApiProperty({
    description: 'Xác nhận mật khẩu mới',
    example: 'newPassword123',
  })
  @IsString()
  @IsNotEmpty({ message: 'Xác nhận mật khẩu không được để trống' })
  confirmPassword: string;
}
