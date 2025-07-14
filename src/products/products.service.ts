import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { In, Repository, QueryRunner } from 'typeorm';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create(createProductDto);
    return this.productRepository.save(product);
  }

  findAll(): Promise<Product[]> {
    return this.productRepository.find();
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOneBy({ id });

    if (!product) {
      throw new NotFoundException(`Produto com ID ${id} não encontrado`);
    }

    return product;
  }

  findByIds(ids: string[]): Promise<Product[]> {
    return this.productRepository.findBy({
      id: In(ids),
    });
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.productRepository.preload({
      id: id,
      ...updateProductDto,
    });

    if (!product) {
      throw new NotFoundException(`Produto com ID ${id} não encontrado`);
    }

    return this.productRepository.save(product);
  }

  async remove(id: string): Promise<void> {
    const result = await this.productRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Produto com ID ${id} não encontrado`);
    }
  }

  async updateStock(
    productId: string,
    quantityChange: number,
    queryRunner: QueryRunner,
  ): Promise<Product> {
    const productRepository = queryRunner.manager.getRepository(Product);
    const product = await productRepository.findOneBy({ id: productId });

    if (!product) {
      throw new NotFoundException(
        `Produto com ID ${productId} não encontrado.`,
      );
    }

    const newStock = product.stock + quantityChange;
    if (newStock < 0) {
      throw new BadRequestException(
        `Estoque insuficiente para o produto: ${product.name}`,
      );
    }

    product.stock = newStock;
    return productRepository.save(product);
  }
}
