import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  Request,
  Logger,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/v1/products')
export class ProductsController {
  private readonly logger = new Logger(ProductsController.name);

  constructor(private productsService: ProductsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createProduct(@Request() req: any, @Body() createProductDto: CreateProductDto) {
    this.logger.log(`Creating product: ${createProductDto.name}`);
    const product = await this.productsService.createProduct(req.user.storeId, createProductDto);
    return {
      success: true,
      data: product,
      timestamp: new Date(),
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async listProducts(@Request() req: any, @Query('page') page = '1', @Query('limit') limit = '20') {
    this.logger.log('Listing products');
    const result = await this.productsService.listProducts(
      req.user.storeId,
      parseInt(page),
      parseInt(limit),
    );
    return {
      success: true,
      data: result.data,
      pagination: result.pagination,
      timestamp: new Date(),
    };
  }

  @Get('search')
  @UseGuards(JwtAuthGuard)
  async searchProducts(
    @Request() req: any,
    @Query('q') query: string,
    @Query('category') category?: string,
    @Query('limit') limit = '20',
  ) {
    this.logger.log(`Searching products: ${query}`);
    const products = await this.productsService.searchProducts(
      req.user.storeId,
      query,
      category,
      parseInt(limit),
    );
    return {
      success: true,
      data: products,
      timestamp: new Date(),
    };
  }

  @Get('barcode/:barcode')
  @UseGuards(JwtAuthGuard)
  async getProductByBarcode(@Request() req: any, @Param('barcode') barcode: string) {
    this.logger.log(`Looking up product by barcode: ${barcode}`);
    const product = await this.productsService.getProductByBarcode(req.user.storeId, barcode);
    return {
      success: true,
      data: product,
      timestamp: new Date(),
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getProduct(@Request() req: any, @Param('id') productId: string) {
    this.logger.log(`Fetching product: ${productId}`);
    const product = await this.productsService.getProductById(req.user.storeId, productId);
    return {
      success: true,
      data: product,
      timestamp: new Date(),
    };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async updateProduct(
    @Request() req: any,
    @Param('id') productId: string,
    @Body() updateData: any,
  ) {
    this.logger.log(`Updating product: ${productId}`);
    const product = await this.productsService.updateProduct(req.user.storeId, productId, updateData);
    return {
      success: true,
      data: product,
      timestamp: new Date(),
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteProduct(@Request() req: any, @Param('id') productId: string) {
    this.logger.log(`Deleting product: ${productId}`);
    const result = await this.productsService.deleteProduct(req.user.storeId, productId);
    return {
      success: true,
      data: result,
      timestamp: new Date(),
    };
  }
}
