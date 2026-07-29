import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { JwtPayload } from '../../../auth/application/common/jwt-payload';
import { CurrentUser } from '../../../shared/security/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../../shared/security/guards/jwt-auth.guard';
import { WhiteboardService } from '../../application/services/whiteboard.service';
import { WhiteboardDocument } from '../../domain/models/whiteboard.model';
import { SaveWhiteboardRequest } from '../requests/save-whiteboard.request';

@UseGuards(JwtAuthGuard)
@Controller('whiteboard')
export class WhiteboardController {
  constructor(private readonly whiteboard: WhiteboardService) {}

  @Get()
  async get(@CurrentUser() user: JwtPayload): Promise<WhiteboardDocument> {
    return this.whiteboard.get(user.sub);
  }

  @Put()
  async save(
    @CurrentUser() user: JwtPayload,
    @Body() request: SaveWhiteboardRequest,
  ): Promise<WhiteboardDocument> {
    return this.whiteboard.save(user.sub, request);
  }
}
