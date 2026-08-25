export async function GET() {
  const categories = [
    {
      id: 1,
      name: 'Electronics',
      description: 'Discover the latest gadgets, accessories, and smart devices for everyday life.',

      images: {
        mainImage: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800',
        bannerImage: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=1600',
        thumbnailImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=200',
      },

      promotion: {
        title: 'Tech Deals',
        message: 'Save up to 30% on selected electronics this week.',
      },
    },
    {
      id: 2,
      name: 'Clothing',
      description: 'Shop stylish apparel for every season and occasion.',

      images: {
        mainImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
        bannerImage: 'https://images.unsplash.com/photo-1521334884684-d80222895322?w=1600',
        thumbnailImage: 'https://images.unsplash.com/photo-1520975954732-35dd22299614?w=200',
      },

      promotion: {
        title: 'New Season Drop',
        message: 'Fresh styles just arrived. Limited stock available.',
      },
    },
    {
      id: 3,
      name: 'Books',
      description: 'Browse bestselling novels, educational resources, and timeless classics.',

      images: {
        mainImage: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800',
        bannerImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=1600',
        thumbnailImage: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=200',
      },

      promotion: {
        title: 'Reader Picks',
        message: 'Buy 2 get 1 free on selected titles.',
      },
    },
  ];

  return Response.json({
    status: 'ok',
    data: categories,
  });
}
