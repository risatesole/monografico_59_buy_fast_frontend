import { NextRequest, NextResponse } from 'next/server';
import ProductService from '@/services/products/ProductService';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const offset = parseInt(searchParams.get('offset') || '0');
    const limit = parseInt(searchParams.get('limit') || '48');
    const tags = searchParams.getAll('tags');

    const productService = new ProductService();
    const products = await productService.getProducts({
      tags: tags.length > 0 ? tags : ['featured'],
      limit,
      offset,
    });

    return NextResponse.json({ data: products });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
