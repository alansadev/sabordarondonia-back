import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { In, Repository, QueryRunner } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly cloudinaryService: CloudinaryService, // <--- Injeção
  ) {}

  async create(
    createProductDto: CreateProductDto,
    file?: Express.Multer.File,
  ): Promise<Product> {
    // 1. Upload da Imagem (se existir)
    if (file) {
      const imageUrl = await this.cloudinaryService.uploadImage(file);
      createProductDto.imageUrl = imageUrl;
    }

    const product = this.productRepository.create(createProductDto);
    const savedProduct = await this.productRepository.save(product);

    // 2. Invalida Cache
    await this.cacheManager.del('all_products');

    return savedProduct;
  }

  async findAll(): Promise<Product[]> {
    const cachedProducts =
      await this.cacheManager.get<Product[]>('all_products');
    if (cachedProducts) {
      return cachedProducts;
    }

    const products = await this.productRepository.find({
      order: { name: 'ASC' },
    });

    // TTL padrão definido no AppModule (ex: 5 min)
    await this.cacheManager.set('all_products', products);

    return products;
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOneBy({ id });
    if (!product) {
      throw new NotFoundException(`Produto com ID ${id} não encontrado`);
    }
    return product;
  }

  async findByIds(ids: string[]): Promise<Product[]> {
    return this.productRepository.findBy({ id: In(ids) });
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
    file?: Express.Multer.File,
  ): Promise<Product> {
    // 1. Upload da Imagem Nova (se existir)
    if (file) {
      const imageUrl = await this.cloudinaryService.uploadImage(file);
      updateProductDto.imageUrl = imageUrl;
    }

    const product = await this.productRepository.preload({
      id: id,
      ...updateProductDto,
    });

    if (!product) {
      throw new NotFoundException(`Produto com ID ${id} não encontrado`);
    }

    const savedProduct = await this.productRepository.save(product);

    // Invalida Cache
    await this.cacheManager.del('all_products');

    return savedProduct;
  }

  async remove(id: string): Promise<void> {
    const result = await this.productRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Produto com ID ${id} não encontrado`);
    }
    await this.cacheManager.del('all_products');
  }

  // --- MÉTODO TRANSACTIONS (Usado pelo OrdersService) ---
  async updateStock(
    productId: string,
    quantityChange: number,
    queryRunner: QueryRunner,
  ): Promise<Product> {
    // Usa o manager da transação, não o repositório global
    const productRepository = queryRunner.manager.getRepository(Product);

    // Pessimistic Write Lock: Impede que dois pedidos baixem o estoque do mesmo produto ao mesmo tempo
    const product = await productRepository.findOne({
      where: { id: productId },
      lock: { mode: 'pessimistic_write' },
    });

    if (!product) {
      throw new NotFoundException(`Produto ${productId} não encontrado.`);
    }

    const newStock = product.stock + quantityChange;
    if (newStock < 0) {
      throw new BadRequestException(`Estoque insuficiente: ${product.name}`);
    }

    product.stock = newStock;
    const saved = await productRepository.save(product);

    // Importante: Não limpamos cache aqui para não gargalar.
    // O cache limpa sozinho no TTL ou quando o Admin edita o produto.
    // Se estoque em tempo real for crítico na listagem, descomente abaixo:
    // await this.cacheManager.del('all_products');

    return saved;
  }
}
