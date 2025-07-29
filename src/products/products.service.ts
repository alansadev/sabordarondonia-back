import FormData from 'form-data';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import axios, { isAxiosError } from 'axios';

import { Product } from 'src/products/entities/product.entity';
import { CreateProductDto } from 'src/products/dto/create-product.dto';
import { UpdateProductDto } from 'src/products/dto/update-product.dto';

function handleAxiosError(err: unknown) {
  const typedError: any = err as any;
  if (isAxiosError(typedError)) {
    const errorMessage = typedError.response?.data?.error || typedError.message;
    console.error(`Axios error when calling the microservice: ${errorMessage}`);
    if (typedError.response?.status === 404) {
      return new NotFoundException(errorMessage);
    }
    if (typedError.response?.status === 400) {
      return new BadRequestException(errorMessage);
    }
    return new Error(
      `Failure to communicate with product service: ${errorMessage}`,
    );
  }

  if (typedError instanceof Error) {
    console.error('Unexpected error:', typedError.message);
    return new Error(`An unexpected error occurred: ${typedError.message}`);
  }

  console.error('Unknown error caught:', typedError);
  return new Error('Unknown error');
}

@Injectable()
export class ProductsService {
  private baseUrl: string;
  private apiKey: string;
  constructor() {
    const goServiceUrl = process.env.GO_PRODUCT_SERVICE_URL;
    const apiKey = process.env.GO_API_SECRET_KEY;

    if (!goServiceUrl || !apiKey) {
      throw new Error(
        'The environment variables GO_PRODUCT_SERVICE_URL and GO_API_SECRET_KEY must be defined.',
      );
    }

    this.baseUrl = `${goServiceUrl}/products`;
    this.apiKey = apiKey;
  }

  async create(
    createProductDto: CreateProductDto,
    imageFile?: Express.Multer.File,
  ): Promise<Product> {
    try {
      const createResponse = await axios.post<Product>(
        `${this.baseUrl}`,
        createProductDto,
        {
          headers: { 'X-API-KEY': this.apiKey },
        },
      );

      const newProduct = createResponse.data;

      if (imageFile && newProduct?.id) {
        const formData = new FormData();

        formData.append('image', imageFile.buffer, imageFile.originalname);

        const uploadResponse = await axios.post<Product>(
          `${this.baseUrl}/${newProduct.id}/upload`,
          formData,
          {
            headers: {
              'X-API-KEY': this.apiKey,
              ...formData.getHeaders(),
            },
          },
        );
        return uploadResponse.data;
      }
      return newProduct;
    } catch (err) {
      throw handleAxiosError(err);
    }
  }

  async findAll(): Promise<Product[]> {
    try {
      const response = await axios.get(`${this.baseUrl}`, {
        headers: { 'X-API-KEY': this.apiKey },
      });
      return response.data;
    } catch (err) {
      throw handleAxiosError(err);
    }
  }

  async findOne(id: string): Promise<Product> {
    try {
      const response = await axios.get(`${this.baseUrl}/${id}`, {
        headers: { 'X-API-KEY': this.apiKey },
      });

      if (!response.data)
        throw new NotFoundException(`Product wiht ID ${id} not found`);
      return response.data;
    } catch (err) {
      throw handleAxiosError(err);
    }
  }

  async findByIds(ids: string[]): Promise<Product[]> {
    if (ids.length === 0) {
      return [];
    }

    try {
      const response = await axios.post<Product[]>(
        `${this.baseUrl}/batch`,
        { ids: ids },
        {
          headers: { 'X-API-KEY': this.apiKey },
        },
      );
      return response.data;
    } catch (err) {
      throw handleAxiosError(err);
    }
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    try {
      const response = await axios.patch<Product>(
        `${this.baseUrl}/${id}`,
        updateProductDto,
        {
          headers: { 'X-API-KEY': this.apiKey },
        },
      );
      return response.data;
    } catch (err) {
      throw handleAxiosError(err);
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await axios.delete(`${this.baseUrl}/${id}`, {
        headers: { 'X-API-KEY': this.apiKey },
      });
    } catch (error) {
      handleAxiosError(error);
    }
  }

  async updateStock(
    productId: string,
    quantityChange: number,
  ): Promise<Product> {
    try {
      const response = await axios.post<Product>(
        `${this.baseUrl}/${productId}/stock`,
        { quantity_change: quantityChange },
        {
          headers: { 'X-API-KEY': this.apiKey },
        },
      );
      return response.data;
    } catch (err) {
      throw handleAxiosError(err);
    }
  }
}
