import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ type: Number })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ type: Number })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  customerId: string;
}
