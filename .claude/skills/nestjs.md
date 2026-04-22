# Skill: NestJS Patterns

## Module Scaffold (use /generate-module <name>)

```typescript
// <name>.module.ts
@Module({
  imports: [PrismaModule],
  controllers: [<Name>Controller],
  providers: [<Name>Service],
  exports: [<Name>Service],
})
export class <Name>Module {}
```

## Service Pattern

```typescript
@Injectable()
export class <Name>Service {
  private readonly logger = new Logger(<Name>Service.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string): Promise<<Name>[]> {
    return this.prisma.<name>.findMany({ where: { userId } });
  }

  async findOne(id: string): Promise<<Name>> {
    const item = await this.prisma.<name>.findUnique({ where: { id } });
    if (!item) throw new NotFoundException(`<Name> ${id} not found`);
    return item;
  }

  async create(dto: Create<Name>Dto, userId: string): Promise<<Name>> {
    return this.prisma.<name>.create({ data: { ...dto, userId } });
  }

  async update(id: string, dto: Update<Name>Dto): Promise<<Name>> {
    await this.findOne(id);
    return this.prisma.<name>.update({ where: { id }, data: dto });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.<name>.delete({ where: { id } });
  }
}
```

## Controller Pattern

```typescript
@ApiTags('<names>')
@UseGuards(JwtAuthGuard)
@Controller('<names>')
export class <Name>Controller {
  constructor(private readonly <name>Service: <Name>Service) {}

  @Post()
  @ApiOperation({ summary: 'Create <name>' })
  create(@Body() dto: Create<Name>Dto, @CurrentUser() user: User) {
    return this.<name>Service.create(dto, user.id);
  }

  @Get()
  findAll(@CurrentUser() user: User) {
    return this.<name>Service.findAll(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.<name>Service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Update<Name>Dto) {
    return this.<name>Service.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  @UseGuards(RolesGuard)
  remove(@Param('id') id: string) {
    return this.<name>Service.remove(id);
  }
}
```

## DTO Pattern

```typescript
export class Create<Name>Dto {
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  @ApiProperty()
  title: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  description?: string;
}

export class Update<Name>Dto extends PartialType(Create<Name>Dto) {}
```

## Prisma Transaction Pattern

```typescript
await this.prisma.$transaction(async (tx) => {
  const ticket = await tx.ticket.update({ where: { id }, data });
  await tx.auditLog.create({ data: { action: 'UPDATED', entityId: id } });
  return ticket;
});
```

## Exception Hierarchy
- `NotFoundException` — 404, resource not found
- `BadRequestException` — 400, invalid input
- `ForbiddenException` — 403, insufficient permissions
- `UnauthorizedException` — 401, no valid token
- `ConflictException` — 409, duplicate resource

## Validation Pipe Setup (main.ts)
```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
);
```
