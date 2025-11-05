import { Product } from '../types';

export const products: Product[] = [
  {
    id: '1',
    name: "Men's Crewneck Sweatshirt",
    price: 10.99,
    image: 'https://raw.githubusercontent.com/Solved-Overnight/arvana-clothing/refs/heads/main/img/collections/man_dropsholder1.jpg',
    images: [
      'https://raw.githubusercontent.com/Solved-Overnight/arvana-clothing/refs/heads/main/img/collections/man_dropsholder1.jpg',
      'https://raw.githubusercontent.com/Solved-Overnight/arvana-clothing/refs/heads/main/img/collections/man_dropsholder2.jpg'
    ],
    category: 'tops',
    description: 'Soft premium cotton t-shirt with a modern fit. Perfect for everyday wear with superior comfort and style.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Black', 'White', 'Navy', 'Gray'],
    isNew: true,
    rating: 4.5,
    reviews: 128
  },
  {
    id: '2',
    name: 'Slim Fit Denim Jeans',
    price: 20.99,
    originalPrice: 30.99,
    image: 'https://raw.githubusercontent.com/Solved-Overnight/arvana-clothing/refs/heads/main/img/collections/women_denim_1.jpg',
    images: [
      'https://raw.githubusercontent.com/Solved-Overnight/arvana-clothing/refs/heads/main/img/collections/women_denim_1.jpg',
      'https://raw.githubusercontent.com/Solved-Overnight/arvana-clothing/refs/heads/main/img/collections/woman_item5.jpg'
    ],
    category: 'bottoms',
    description: 'Classic slim-fit denim jeans crafted from premium denim. Features a comfortable stretch and timeless style.',
    sizes: ['28', '30', '32', '34', '36'],
    colors: ['Dark Blue', 'Light Blue', 'Black'],
    isSale: true,
    rating: 4.7,
    reviews: 89
  },
  {
    id: '3',
    name: 'Wool Blend Sweater',
    price: 45.99,
    image: 'https://raw.githubusercontent.com/Solved-Overnight/arvana-clothing/refs/heads/main/img/collections/woman_item4.jpg',
    images: [
      'https://raw.githubusercontent.com/Solved-Overnight/arvana-clothing/refs/heads/main/img/collections/woman_item3.jpg',
      'https://raw.githubusercontent.com/Solved-Overnight/arvana-clothing/refs/heads/main/img/collections/woman_item2.jpg'
    ],
    category: 'sweaters',
    description: 'Luxurious wool blend sweater with a cozy feel. Perfect for cooler weather with elegant styling.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Beige', 'Navy', 'Charcoal', 'Cream'],
    rating: 4.8,
    reviews: 156
  },
  {
    id: '4',
    name: 'Casual Button-Down Shirt',
    price: 59.99,
    image: 'https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg?auto=compress&cs=tinysrgb&w=800',
    images: [
      'https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    category: 'shirts',
    description: 'Versatile button-down shirt perfect for both casual and formal occasions. Made from breathable cotton.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['White', 'Light Blue', 'Navy', 'Gray'],
    rating: 4.4,
    reviews: 73
  },
  {
    id: '5',
    name: "Men's Quarter-Zip Sweatshirt",
    price: 25.99,
    image: 'https://raw.githubusercontent.com/Solved-Overnight/arvana-clothing/refs/heads/main/img/collections/man_chain1.jpg',
    images: [
      'https://raw.githubusercontent.com/Solved-Overnight/arvana-clothing/refs/heads/main/img/collections/man_chain1.jpg'
    ],
    category: 'tops',
    description: 'Premium Quarter-Zip Sweatshirt with a timeless design. Features quality craftsmanship and durability.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Teal', 'Brown', 'Black'],
    rating: 4.9,
    reviews: 234
  },
  {
    id: '6',
    name: 'Unisex Oversized Hoodie',
    price: 15.99,
    image: 'https://raw.githubusercontent.com/Solved-Overnight/arvana-clothing/refs/heads/main/img/collections/man_hoodie1.jpg',
    images: [
      'https://raw.githubusercontent.com/Solved-Overnight/arvana-clothing/refs/heads/main/img/collections/man_hoodie1.jpg'
    ],
    category: 'sweaters',
    description: 'Classic hoodie with a modern fit. Perfect for smart-casual occasions with comfortable wear.',
    sizes: ['28', '30', '32', '34', '36'],
    colors: ['Khaki', 'Navy', 'Black', 'Olive'],
    rating: 4.3,
    reviews: 67
  },
  {
    id: '7',
    name: "Men's Polo Shirt",
    price: 10.99,
    image: 'https://raw.githubusercontent.com/Solved-Overnight/arvana-clothing/refs/heads/main/img/collections/man_poloshirt2.jpg',
    images: [
      'https://raw.githubusercontent.com/Solved-Overnight/arvana-clothing/refs/heads/main/img/collections/man_poloshirt2.jpg',
      'https://raw.githubusercontent.com/Solved-Overnight/arvana-clothing/refs/heads/main/img/collections/man_poloshirt1.jpg'
    ],
    category: 'shirts',
    description: 'Classic polo shirt with a modern twist. Made from breathable cotton with a comfortable fit.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Gray', 'Navy', 'Cream', 'Burgundy'],
    isNew: true,
    rating: 4.6,
    reviews: 92
  },
  {
    id: '8',
    name: "Men's Denim Streetwear Jacket",
    price: 39.99,
    image: 'https://raw.githubusercontent.com/Solved-Overnight/arvana-clothing/refs/heads/main/img/collections/home_man_model_3.jpg',
    images: [
      'https://raw.githubusercontent.com/Solved-Overnight/arvana-clothing/refs/heads/main/img/collections/home_man_model_3.jpg',
      'https://raw.githubusercontent.com/Solved-Overnight/arvana-clothing/refs/heads/main/img/collections/men_denim_1.jpg'
    ],
    category: 'jackets',
    description: 'Classic polo shirt with a modern twist. Made from breathable cotton with a comfortable fit.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Brown', 'Navy', 'Black'],
    rating: 4.2,
    reviews: 45
  }
];

export const categories = [
  { id: 'all', name: 'All Products', count: products.length },
  { id: 'tops', name: 'Tops', count: products.filter(p => p.category === 'tops').length },
  { id: 'bottoms', name: 'Bottoms', count: products.filter(p => p.category === 'bottoms').length },
  { id: 'shirts', name: 'Shirts', count: products.filter(p => p.category === 'shirts').length },
  { id: 'sweaters', name: 'Sweaters', count: products.filter(p => p.category === 'sweaters').length },
  { id: 'jackets', name: 'Jackets', count: products.filter(p => p.category === 'jackets').length }
];
