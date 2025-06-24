import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { ObjectId } from 'mongodb';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  // Método para criar um produto
  create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create(createProductDto);
    return this.productRepository.save(product);
  }

  // Método para buscar todos os produtos
  findAll(): Promise<Product[]> {
    return this.productRepository.find();
  }

  // MÉTODO FUNDAMENTAL QUE RESOLVE O SEU ERRO
  // Ele busca um produto pelo ID e retorna a ENTIDADE COMPLETA
  async findOne(id: string): Promise<Product> {
    if (!ObjectId.isValid(id)) {
      throw new NotFoundException(`Formato de ID de produto inválido: ${id}`);
    }

    const product = await this.productRepository.findOne({
      where: { _id: new ObjectId(id) },
    });

    if (!product) {
      throw new NotFoundException(`Produto com ID ${id} não encontrado`);
    }

    return product;
  }

  update(id: string, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: string) {
    return `This action removes a #${id} product`;
  }
}
