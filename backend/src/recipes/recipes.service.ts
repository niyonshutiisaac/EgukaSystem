import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException, NotFoundException } from '../common/exceptions/api.exception';
import { CreateRecipeDto, UpdateRecipeDto } from './dto/recipe.dto';

@Injectable()
export class RecipesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string, params: { search?: string; activeOnly?: boolean }) {
    const where: Prisma.RecipeWhereInput = { tenantId };
    if (params.activeOnly) where.isActive = true;
    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { product: { name: { contains: params.search, mode: 'insensitive' } } },
      ];
    }
    return this.prisma.recipe.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        product: { select: { id: true, name: true, sku: true, unit: true } },
        ingredients: {
          include: { product: { select: { id: true, name: true, sku: true, unit: true } } },
        },
      },
    });
  }

  async getById(tenantId: string, id: string) {
    const recipe = await this.prisma.recipe.findFirst({
      where: { id, tenantId },
      include: {
        product: { select: { id: true, name: true, sku: true, unit: true } },
        ingredients: {
          include: { product: { select: { id: true, name: true, sku: true, unit: true } } },
        },
      },
    });
    if (!recipe) throw new NotFoundException('Recipe not found');
    return recipe;
  }

  async create(tenantId: string, dto: CreateRecipeDto) {
    const product = await this.prisma.product.findFirst({ where: { id: dto.productId, tenantId } });
    if (!product) throw new NotFoundException('Product not found');
    if (product.isIngredient) {
      throw new ConflictException('A recipe output cannot itself be an ingredient');
    }

    const ingredientIds = dto.ingredients.map((i) => i.productId);
    const ingredients = await this.prisma.product.findMany({
      where: { id: { in: ingredientIds }, tenantId },
    });
    if (ingredients.length !== ingredientIds.length) {
      throw new NotFoundException('One or more ingredients do not exist in this business');
    }
    for (const ing of ingredients) {
      if (!ing.isIngredient) {
        throw new ConflictException(`"${ing.name}" is not marked as an ingredient`);
      }
    }

    const duplicate = await this.prisma.recipe.findFirst({
      where: { tenantId, productId: dto.productId, isActive: true },
    });
    if (duplicate) {
      throw new ConflictException(
        'An active recipe already exists for this product — update it instead',
      );
    }

    return this.prisma.recipe.create({
      data: {
        tenantId,
        productId: dto.productId,
        name: dto.name,
        outputQty: dto.outputQty ?? 1,
        ingredients: {
          create: dto.ingredients.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            wastePercent: i.wastePercent ?? 0,
          })),
        },
      },
      include: {
        product: { select: { id: true, name: true, sku: true } },
        ingredients: { include: { product: { select: { id: true, name: true, sku: true } } } },
      },
    });
  }

  /**
   * Updates create a new version (immutability-friendly: past batches keep
   * the ingredient snapshot of the version they ran against).
   */
  async update(tenantId: string, id: string, dto: UpdateRecipeDto) {
    const recipe = await this.getById(tenantId, id);
    const version = recipe.version + 1;

    if (dto.ingredients) {
      const ingredientIds = dto.ingredients.map((i) => i.productId);
      const ingredients = await this.prisma.product.findMany({
        where: { id: { in: ingredientIds }, tenantId, isIngredient: true },
      });
      if (ingredients.length !== ingredientIds.length) {
        throw new NotFoundException('One or more ingredients are invalid');
      }
    }

    return this.prisma.$transaction(async (tx) => {
      if (dto.ingredients) {
        await tx.recipeIngredient.deleteMany({ where: { recipeId: id } });
        await tx.recipeIngredient.createMany({
          data: dto.ingredients.map((i) => ({
            recipeId: id,
            productId: i.productId,
            quantity: i.quantity,
            wastePercent: i.wastePercent ?? 0,
          })),
        });
      }
      return tx.recipe.update({
        where: { id },
        data: {
          name: dto.name,
          outputQty: dto.outputQty,
          isActive: dto.isActive,
          version,
        },
        include: {
          product: { select: { id: true, name: true, sku: true } },
          ingredients: { include: { product: { select: { id: true, name: true, sku: true } } } },
        },
      });
    });
  }

  async remove(tenantId: string, id: string) {
    await this.getById(tenantId, id);
    const batches = await this.prisma.batch.count({ where: { recipeId: id } });
    if (batches > 0) {
      await this.prisma.recipe.update({ where: { id }, data: { isActive: false } });
      return { deactivated: true, reason: 'Recipe has production history — deactivated' };
    }
    await this.prisma.recipe.delete({ where: { id } });
    return { deleted: true };
  }
}
