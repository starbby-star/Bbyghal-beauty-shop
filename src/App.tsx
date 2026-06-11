/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  BarChart3,
  Search,
  Plus,
  Lock,
  AlertTriangle,
  LogOut,
  Menu,
  X,
  CreditCard,
  Banknote,
  Calendar as CalendarIcon,
  ShoppingBag,
  ChevronRight,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  DollarSign,
  MessageCircle,
  Clock,
  CheckCircle2,
  ChevronLeft,
  Key,
  Zap,
  ClipboardList,
  Edit2,
  Scissors
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CATEGORIES, THEME } from './constants';
import { BRAND } from './constants/brand';
import { Product, Category, Role, Sale, PaymentMethod, Seller, PaymentStatus, CartItem, RequestedProduct } from './types';
import Storefront from './Storefront';
import InventoryPanel from './components/InventoryPanel';
import BraidsPanel from './components/BraidsPanel';
import BraidFilters from './components/BraidFilters';
import { deductStockFIFO, LOW_STOCK_THRESHOLD, HIGH_STOCK_THRESHOLD } from './utils/inventory';
import { BraidFilterState, emptyBraidFilters, filterBraidProducts, getBraidStyle } from './utils/braidFilters';
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

// Mock Data
const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Vitamin C Serum',
    brand: 'Dr Rashel',
    category: 'Facial',
    sellerId: 's1',
    firstPrice: 15,
    lastPrice: 18,
    sellingPrice: 35,
    stockQuantity: 12,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
    shortDescription: 'Helps brighten skin and reduce dark spots.',
    fullDescription: 'Our Vitamin C Serum is a powerful antioxidant that helps to brighten your complexion, even out skin tone, and reduce the appearance of dark spots and fine lines. Formulated with pure Vitamin C and Hyaluronic Acid, it leaves your skin glowing and hydrated.',
    ingredients: 'Aqua, Vitamin C (Ascorbic Acid), Hyaluronic Acid, Glycerin, Aloe Barbadensis Leaf Extract.',
    howToUse: 'Apply 3-4 drops to clean, dry skin every morning. Follow with your favorite moisturizer and sunscreen.',
    rating: 4.8,
    reviewsCount: 124
  },
  {
    id: '2',
    name: 'Matte Lipstick',
    brand: 'Beauty Glazed',
    category: 'Makeup',
    sellerId: 's2',
    firstPrice: 5,
    lastPrice: 6,
    sellingPrice: 12,
    stockQuantity: 3,
    isFixedPrice: false,
    imageUrl: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
    shortDescription: 'Long-lasting color with a flawless matte finish.',
    fullDescription: 'Get bold, beautiful lips with our long-lasting Matte Lipstick. It glides on smoothly, providing intense pigmentation that stays put all day without drying out your lips. Perfect for any occasion!',
    ingredients: 'Isododecane, Dimethicone, Trimethylsiloxysilicate, Polybutene, Petrolatum, Silica, Cyclopentasiloxane.',
    howToUse: 'Exfoliate lips before use. Apply directly to lips starting from the center and blending outwards. Allow to dry for 1 minute.',
    rating: 4.5,
    reviewsCount: 89
  },
  {
    id: 'p_pawpaw',
    name: 'Pawpaw Cream',
    brand: 'Pawpaw',
    category: 'Body',
    sellerId: 's1',
    firstPrice: 250,
    lastPrice: 250,
    sellingPrice: 350,
    stockQuantity: 20,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
    shortDescription: 'Deeply moisturizes and heals dry skin.',
    fullDescription: 'The original Pawpaw Cream is a multi-purpose ointment that deeply moisturizes, soothes, and heals dry, chapped, or irritated skin. Enriched with natural papaya extract, it is a must-have in every beauty kit.',
    ingredients: 'Carica Papaya (Papaya) Fruit Extract, Petroleum Jelly, Beeswax, Potassium Sorbate.',
    howToUse: 'Apply a small amount to dry or irritated areas as needed. Can be used on lips, cuticles, and minor burns.',
    rating: 4.9,
    reviewsCount: 342
  },
  {
    id: 'p_rdl',
    name: 'Premium Human Hair Wig',
    brand: 'Babyghal Exclusives',
    category: 'Hair',
    sellerId: 's1',
    firstPrice: 3500,
    lastPrice: 3500,
    sellingPrice: 5000,
    stockQuantity: 15,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
    shortDescription: '100% human hair, silky and tangle-free.',
    fullDescription: 'Slay every day with our Premium Human Hair Wig. Made from 100% virgin human hair, it offers a natural look, soft texture, and minimal shedding. Can be dyed, bleached, and styled just like your own hair.',
    ingredients: '100% Virgin Human Hair.',
    howToUse: 'Secure your natural hair flat. Adjust the wig straps to fit your head comfortably. Style as desired using heat tools up to 400°F.',
    rating: 5.0,
    reviewsCount: 56
  },
  {
    id: 'p_blackhair',
    name: 'Black Hair Shampoo',
    brand: 'Dexe',
    category: 'Hair',
    sellerId: 's1',
    firstPrice: 30,
    lastPrice: 30,
    sellingPrice: 50,
    stockQuantity: 50,
    isFixedPrice: true,
    imageUrl: 'https://picsum.photos/seed/blackhair/200/200',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_americandream',
    name: 'American Dream Cocoa Butter',
    brand: 'American Dream',
    category: 'Body',
    sellerId: 's1',
    firstPrice: 500,
    lastPrice: 500,
    sellingPrice: 700,
    stockQuantity: 10,
    isFixedPrice: true,
    imageUrl: 'https://picsum.photos/seed/americandream/200/200',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_exfoliating',
    name: 'Exfoliating Shower Gel',
    brand: 'F&W',
    category: 'Body',
    sellerId: 's1',
    firstPrice: 400,
    lastPrice: 400,
    sellingPrice: 550,
    stockQuantity: 12,
    isFixedPrice: true,
    imageUrl: 'https://picsum.photos/seed/showergel/200/200',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_vaseline',
    name: 'Vaseline Body Oil',
    brand: 'Vaseline',
    category: 'Body',
    sellerId: 's1',
    firstPrice: 400,
    lastPrice: 400,
    sellingPrice: 550,
    stockQuantity: 18,
    isFixedPrice: true,
    imageUrl: 'https://picsum.photos/seed/vaseline/200/200',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_dove',
    name: 'Dove Soap',
    brand: 'Dove',
    category: 'Soaps',
    sellerId: 's1',
    firstPrice: 150,
    lastPrice: 150,
    sellingPrice: 200,
    stockQuantity: 25,
    isFixedPrice: true,
    imageUrl: 'https://picsum.photos/seed/dove/200/200',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_kojic',
    name: 'Kojic Acid Soap',
    brand: 'Kojie San',
    category: 'Soaps',
    sellerId: 's1',
    firstPrice: 150,
    lastPrice: 150,
    sellingPrice: 200,
    stockQuantity: 30,
    isFixedPrice: true,
    imageUrl: 'https://picsum.photos/seed/kojic/200/200',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_tumeric',
    name: 'Turmeric Soap',
    brand: 'Generic',
    category: 'Soaps',
    sellerId: 's1',
    firstPrice: 180,
    lastPrice: 180,
    sellingPrice: 250,
    stockQuantity: 20,
    isFixedPrice: true,
    imageUrl: 'https://picsum.photos/seed/tumeric/200/200',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_asante',
    name: 'Asante Papaya Soap',
    brand: 'Asante',
    category: 'Soaps',
    sellerId: 's1',
    firstPrice: 180,
    lastPrice: 180,
    sellingPrice: 250,
    stockQuantity: 22,
    isFixedPrice: true,
    imageUrl: 'https://picsum.photos/seed/asante/200/200',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_dearbody',
    name: 'Dear Body Splash',
    brand: 'Dear Body',
    category: 'Perfumes',
    sellerId: 's1',
    firstPrice: 300,
    lastPrice: 300,
    sellingPrice: 450,
    stockQuantity: 15,
    isFixedPrice: true,
    imageUrl: 'https://picsum.photos/seed/dearbody/200/200',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_wrapmousse',
    name: 'Olive Oil Wrap/Set Mousse',
    brand: 'ORS',
    category: 'Hair',
    sellerId: 's1',
    firstPrice: 200,
    lastPrice: 200,
    sellingPrice: 300,
    stockQuantity: 10,
    isFixedPrice: true,
    imageUrl: 'https://picsum.photos/seed/wrapmousse/200/200',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_nailfiles',
    name: 'Nail Files (Pack)',
    brand: 'Generic',
    category: 'Nails',
    sellerId: 's1',
    firstPrice: 50,
    lastPrice: 50,
    sellingPrice: 100,
    stockQuantity: 40,
    isFixedPrice: true,
    imageUrl: 'https://picsum.photos/seed/nailfiles/200/200',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_nailbuffer',
    name: 'Nail Buffer Block',
    brand: 'Generic',
    category: 'Nails',
    sellerId: 's1',
    firstPrice: 20,
    lastPrice: 20,
    sellingPrice: 50,
    stockQuantity: 35,
    isFixedPrice: true,
    imageUrl: 'https://picsum.photos/seed/nailbuffer/200/200',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_nivea',
    name: 'Nivea Body Lotion (Assorted)',
    brand: 'Nivea',
    category: 'Body',
    sellerId: 's1',
    firstPrice: 450,
    lastPrice: 450,
    sellingPrice: 600,
    stockQuantity: 25,
    isFixedPrice: true,
    imageUrl: 'https://picsum.photos/seed/nivea/200/200',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_nivea_400',
    name: 'Nivea 400ml',
    brand: 'Nivea',
    category: 'Body',
    sellerId: 's1',
    firstPrice: 480,
    lastPrice: 480,
    sellingPrice: 600,
    stockQuantity: 20,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_buffer_combat',
    name: 'Buffer Combat',
    brand: 'Generic',
    category: 'Nails',
    sellerId: 's1',
    firstPrice: 380,
    lastPrice: 380,
    sellingPrice: 50,
    stockQuantity: 15,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_nail_file_pkt',
    name: 'Nail File',
    brand: 'Generic',
    category: 'Nails',
    sellerId: 's1',
    firstPrice: 500,
    lastPrice: 500,
    sellingPrice: 100,
    stockQuantity: 15,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_mousse',
    name: 'Mousse',
    brand: 'Generic',
    category: 'Hair',
    sellerId: 's1',
    firstPrice: 200,
    lastPrice: 200,
    sellingPrice: 300,
    stockQuantity: 20,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_skala_small',
    name: 'Skala Small',
    brand: 'Skala',
    category: 'Hair',
    sellerId: 's1',
    firstPrice: 45,
    lastPrice: 45,
    sellingPrice: 60,
    stockQuantity: 30,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1580870059865-fb4d81226063?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_skala_big',
    name: 'Skala Big',
    brand: 'Skala',
    category: 'Hair',
    sellerId: 's1',
    firstPrice: 150,
    lastPrice: 150,
    sellingPrice: 200,
    stockQuantity: 25,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1580870059865-fb4d81226063?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_nails',
    name: 'Nails',
    brand: 'Generic',
    category: 'Nails',
    sellerId: 's1',
    firstPrice: 400,
    lastPrice: 400,
    sellingPrice: 500,
    stockQuantity: 20,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_dear_body',
    name: 'Dear Body',
    brand: 'Dear Body',
    category: 'Body',
    sellerId: 's1',
    firstPrice: 300,
    lastPrice: 300,
    sellingPrice: 450,
    stockQuantity: 15,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1599305090598-fe179d501227?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_asante_soap',
    name: 'Asante Soap',
    brand: 'Asante',
    category: 'Soaps',
    sellerId: 's1',
    firstPrice: 150,
    lastPrice: 150,
    sellingPrice: 250,
    stockQuantity: 30,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_argon_oil',
    name: 'Argon Oil',
    brand: 'Generic',
    category: 'Hair',
    sellerId: 's1',
    firstPrice: 200,
    lastPrice: 200,
    sellingPrice: 300,
    stockQuantity: 20,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1611558709798-e009c8fd7706?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_lash_glue',
    name: 'Bonding Glue',
    brand: 'Generic',
    category: 'Makeup',
    sellerId: 's1',
    firstPrice: 80,
    lastPrice: 80,
    sellingPrice: 150,
    stockQuantity: 40,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_green_tea_pods',
    name: 'Green Tea Pods',
    brand: 'Generic',
    category: 'Facial',
    sellerId: 's1',
    firstPrice: 180,
    lastPrice: 180,
    sellingPrice: 250,
    stockQuantity: 25,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_vaseline_oil',
    name: 'Vaseline Oil',
    brand: 'Vaseline',
    category: 'Body',
    sellerId: 's1',
    firstPrice: 400,
    lastPrice: 400,
    sellingPrice: 550,
    stockQuantity: 15,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1503236823255-94609f598e71?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_subaru_pkt',
    name: 'Subaru',
    brand: 'Subaru',
    category: 'Hair',
    sellerId: 's1',
    firstPrice: 400,
    lastPrice: 400,
    sellingPrice: 80,
    stockQuantity: 10,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_black_shampoo_pkt',
    name: 'Black Shampoo (Packet of 10)',
    brand: 'Generic',
    category: 'Hair',
    sellerId: 's1',
    firstPrice: 150,
    lastPrice: 150,
    sellingPrice: 250,
    stockQuantity: 20,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_pretty_be_gel',
    name: 'Shower gel Pretty Be',
    brand: 'Pretty Be',
    category: 'Body',
    sellerId: 's1',
    firstPrice: 450,
    lastPrice: 450,
    sellingPrice: 650,
    stockQuantity: 15,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_pretty_bee_gel_small',
    name: 'Shower gel Pretty Bee (Small)',
    brand: 'Pretty Bee',
    category: 'Body',
    sellerId: 's1',
    firstPrice: 50,
    lastPrice: 50,
    sellingPrice: 100,
    stockQuantity: 30,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_lip_serum',
    name: 'Lip serum',
    brand: 'Generic',
    category: 'Makeup',
    sellerId: 's1',
    firstPrice: 80,
    lastPrice: 80,
    sellingPrice: 150,
    stockQuantity: 25,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_american_cream',
    name: 'American Cream',
    brand: 'American Dream',
    category: 'Body',
    sellerId: 's1',
    firstPrice: 550,
    lastPrice: 550,
    sellingPrice: 750,
    stockQuantity: 15,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1599305090598-fe179d501227?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_vaseline_cocoa',
    name: 'Vaseline Cocoa Radiant',
    brand: 'Vaseline',
    category: 'Body',
    sellerId: 's1',
    firstPrice: 450,
    lastPrice: 450,
    sellingPrice: 650,
    stockQuantity: 20,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1503236823255-94609f598e71?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_assorted_soaps',
    name: 'Assorted soaps',
    brand: 'Generic',
    category: 'Soaps',
    sellerId: 's1',
    firstPrice: 200,
    lastPrice: 200,
    sellingPrice: 300,
    stockQuantity: 30,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_exfoliating_gel',
    name: 'Exfoliating shower gel',
    brand: 'Generic',
    category: 'Body',
    sellerId: 's1',
    firstPrice: 450,
    lastPrice: 450,
    sellingPrice: 650,
    stockQuantity: 15,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_molding_wax',
    name: 'Molding wax',
    brand: 'Generic',
    category: 'Hair',
    sellerId: 's1',
    firstPrice: 400,
    lastPrice: 400,
    sellingPrice: 600,
    stockQuantity: 20,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_nivea_q10',
    name: 'Nivea lotion (400ml) Q10',
    brand: 'Nivea',
    category: 'Body',
    sellerId: 's1',
    firstPrice: 480,
    lastPrice: 480,
    sellingPrice: 650,
    stockQuantity: 20,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_argan_oil_lotion',
    name: 'Argan oil lotion',
    brand: 'Generic',
    category: 'Body',
    sellerId: 's1',
    firstPrice: 350,
    lastPrice: 350,
    sellingPrice: 500,
    stockQuantity: 15,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1611558709798-e009c8fd7706?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_pop_cream',
    name: 'Pop cream',
    brand: 'Generic',
    category: 'Body',
    sellerId: 's1',
    firstPrice: 200,
    lastPrice: 200,
    sellingPrice: 350,
    stockQuantity: 20,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1599305090598-fe179d501227?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_h_glow',
    name: 'H glow lotion',
    brand: 'Generic',
    category: 'Body',
    sellerId: 's1',
    firstPrice: 380,
    lastPrice: 380,
    sellingPrice: 550,
    stockQuantity: 15,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_eas_skin',
    name: 'Eas skin well lotion',
    brand: 'Generic',
    category: 'Body',
    sellerId: 's1',
    firstPrice: 340,
    lastPrice: 340,
    sellingPrice: 500,
    stockQuantity: 15,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_turmeric_oil_100',
    name: 'Turmeric oil (100ml)',
    brand: 'Generic',
    category: 'Facial',
    sellerId: 's1',
    firstPrice: 50,
    lastPrice: 50,
    sellingPrice: 150,
    stockQuantity: 30,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1611558709798-e009c8fd7706?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_turmeric_oil_large',
    name: 'Tumeric oil',
    brand: 'Generic',
    category: 'Facial',
    sellerId: 's1',
    firstPrice: 700,
    lastPrice: 700,
    sellingPrice: 950,
    stockQuantity: 10,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1611558709798-e009c8fd7706?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_dr_rashel_cleanser',
    name: 'Cleanser Dr. Rashel',
    brand: 'Dr Rashel',
    category: 'Facial',
    sellerId: 's1',
    firstPrice: 230,
    lastPrice: 230,
    sellingPrice: 400,
    stockQuantity: 20,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_wokali',
    name: 'Wokali',
    brand: 'Wokali',
    category: 'Body',
    sellerId: 's1',
    firstPrice: 180,
    lastPrice: 180,
    sellingPrice: 300,
    stockQuantity: 20,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1599305090598-fe179d501227?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_disaar_cream',
    name: 'Disaar cream',
    brand: 'Disaar',
    category: 'Body',
    sellerId: 's1',
    firstPrice: 180,
    lastPrice: 180,
    sellingPrice: 300,
    stockQuantity: 20,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1599305090598-fe179d501227?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_molato_cream',
    name: 'Molato cream',
    brand: 'Generic',
    category: 'Body',
    sellerId: 's1',
    firstPrice: 360,
    lastPrice: 360,
    sellingPrice: 550,
    stockQuantity: 15,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1599305090598-fe179d501227?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_sara_v',
    name: 'Sara V cream',
    brand: 'Sara V',
    category: 'Body',
    sellerId: 's1',
    firstPrice: 400,
    lastPrice: 400,
    sellingPrice: 600,
    stockQuantity: 15,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1599305090598-fe179d501227?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_coffee_scrub_350',
    name: 'Coffee scrub (350g)',
    brand: 'Generic',
    category: 'Body',
    sellerId: 's1',
    firstPrice: 230,
    lastPrice: 230,
    sellingPrice: 400,
    stockQuantity: 20,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_coffee_scrub_600',
    name: 'Coffee scrub (600g)',
    brand: 'Generic',
    category: 'Body',
    sellerId: 's1',
    firstPrice: 330,
    lastPrice: 330,
    sellingPrice: 500,
    stockQuantity: 15,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_omni_gold',
    name: 'Omni gold lotion',
    brand: 'Omni Gold',
    category: 'Body',
    sellerId: 's1',
    firstPrice: 300,
    lastPrice: 300,
    sellingPrice: 450,
    stockQuantity: 15,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_gluta_gold',
    name: 'Gluta gold oil',
    brand: 'Gluta Gold',
    category: 'Body',
    sellerId: 's1',
    firstPrice: 330,
    lastPrice: 330,
    sellingPrice: 500,
    stockQuantity: 15,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1611558709798-e009c8fd7706?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_amara_400',
    name: 'Amara 400 ml lotion',
    brand: 'Amara',
    category: 'Body',
    sellerId: 's1',
    firstPrice: 240,
    lastPrice: 240,
    sellingPrice: 400,
    stockQuantity: 20,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_amara_200',
    name: 'Amara 200 ml lotion',
    brand: 'Amara',
    category: 'Body',
    sellerId: 's1',
    firstPrice: 150,
    lastPrice: 150,
    sellingPrice: 250,
    stockQuantity: 20,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_aramis_50',
    name: 'Aramis 50 grams',
    brand: 'Aramis',
    category: 'Body',
    sellerId: 's1',
    firstPrice: 40,
    lastPrice: 40,
    sellingPrice: 100,
    stockQuantity: 30,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1599305090598-fe179d501227?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_aramis_90',
    name: 'Aramis 90 grams',
    brand: 'Aramis',
    category: 'Body',
    sellerId: 's1',
    firstPrice: 60,
    lastPrice: 60,
    sellingPrice: 150,
    stockQuantity: 25,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1599305090598-fe179d501227?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_baby_care_100',
    name: 'Baby Care 100 grams',
    brand: 'Baby Care',
    category: 'Body',
    sellerId: 's1',
    firstPrice: 65,
    lastPrice: 65,
    sellingPrice: 150,
    stockQuantity: 30,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1503236823255-94609f598e71?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_baby_oil_bath_240',
    name: 'Baby Oil Bath 240 ml',
    brand: 'Generic',
    category: 'Body',
    sellerId: 's1',
    firstPrice: 280,
    lastPrice: 280,
    sellingPrice: 450,
    stockQuantity: 15,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1503236823255-94609f598e71?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_bamsi_conditioner_500',
    name: 'Bamsi Conditioner 500 ml',
    brand: 'Bamsi',
    category: 'Hair',
    sellerId: 's1',
    firstPrice: 110,
    lastPrice: 110,
    sellingPrice: 250,
    stockQuantity: 20,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_bamsi_locks_spray_120',
    name: 'Bamsi Locks Spray 120 ml',
    brand: 'Bamsi',
    category: 'Hair',
    sellerId: 's1',
    firstPrice: 130,
    lastPrice: 130,
    sellingPrice: 250,
    stockQuantity: 20,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_bamsi_waxes_80',
    name: 'Bamsi Waxes 80 grams',
    brand: 'Bamsi',
    category: 'Hair',
    sellerId: 's1',
    firstPrice: 140,
    lastPrice: 140,
    sellingPrice: 250,
    stockQuantity: 25,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_bamsi_shampoo_500',
    name: 'Bamsi Shampoo 500 ml',
    brand: 'Bamsi',
    category: 'Hair',
    sellerId: 's1',
    firstPrice: 110,
    lastPrice: 110,
    sellingPrice: 250,
    stockQuantity: 20,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_cream_of_nature_dye',
    name: 'Cream of Nature Dye',
    brand: 'Cream of Nature',
    category: 'Hair',
    sellerId: 's1',
    firstPrice: 720,
    lastPrice: 720,
    sellingPrice: 1000,
    stockQuantity: 10,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1580870059865-fb4d81226063?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_cussions_baby_jelly_100',
    name: 'Cussions Baby Jelly 100 grams',
    brand: 'Cussions',
    category: 'Body',
    sellerId: 's1',
    firstPrice: 170,
    lastPrice: 170,
    sellingPrice: 300,
    stockQuantity: 20,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1503236823255-94609f598e71?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_soft_n_free_styling',
    name: 'Soft N Free Styling',
    brand: 'Soft N Free',
    category: 'Hair',
    sellerId: 's1',
    firstPrice: 150,
    lastPrice: 150,
    sellingPrice: 250,
    stockQuantity: 20,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_tcb_relaxer_250',
    name: 'TCB Relaxer Regular 250 ml',
    brand: 'TCB',
    category: 'Hair',
    sellerId: 's1',
    firstPrice: 250,
    lastPrice: 250,
    sellingPrice: 400,
    stockQuantity: 15,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1580870059865-fb4d81226063?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_valon_100',
    name: 'Valon 100 grams',
    brand: 'Valon',
    category: 'Body',
    sellerId: 's1',
    firstPrice: 150,
    lastPrice: 150,
    sellingPrice: 250,
    stockQuantity: 25,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1599305090598-fe179d501227?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_varsman_lotion_200',
    name: 'Varsman Lotion 200 ml',
    brand: 'Varsman',
    category: 'Body',
    sellerId: 's1',
    firstPrice: 280,
    lastPrice: 280,
    sellingPrice: 450,
    stockQuantity: 15,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_varsman_lotion_400',
    name: 'Varsman Lotion 400 ml',
    brand: 'Varsman',
    category: 'Body',
    sellerId: 's1',
    firstPrice: 450,
    lastPrice: 450,
    sellingPrice: 650,
    stockQuantity: 15,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_zoe_lotion_200',
    name: 'Zoe Lotion 200 ml',
    brand: 'Zoe',
    category: 'Body',
    sellerId: 's1',
    firstPrice: 150,
    lastPrice: 150,
    sellingPrice: 250,
    stockQuantity: 20,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_zoe_lotion_400',
    name: 'Zoe lotion 400 ml',
    brand: 'Zoe',
    category: 'Body',
    sellerId: 's1',
    firstPrice: 250,
    lastPrice: 250,
    sellingPrice: 400,
    stockQuantity: 20,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_fine_surgical_spirit',
    name: 'Fine Surgical Spirit',
    brand: 'Generic',
    category: 'Body',
    sellerId: 's1',
    firstPrice: 100,
    lastPrice: 100,
    sellingPrice: 200,
    stockQuantity: 30,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_aceton_60',
    name: 'Aceton 60 ml',
    brand: 'Generic',
    category: 'Nails',
    sellerId: 's1',
    firstPrice: 70,
    lastPrice: 70,
    sellingPrice: 150,
    stockQuantity: 40,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_cuticle_gel_60',
    name: 'Cuticle Gel 60 grams',
    brand: 'Generic',
    category: 'Nails',
    sellerId: 's1',
    firstPrice: 100,
    lastPrice: 100,
    sellingPrice: 200,
    stockQuantity: 25,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_wooden_comb',
    name: 'Wooden Comb',
    brand: 'Generic',
    category: 'Hair',
    sellerId: 's1',
    firstPrice: 50,
    lastPrice: 50,
    sellingPrice: 100,
    stockQuantity: 50,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1580870059865-fb4d81226063?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_korean_hair_band',
    name: 'Korean Hair Band',
    brand: 'Generic',
    category: 'Hair',
    sellerId: 's1',
    firstPrice: 15,
    lastPrice: 15,
    sellingPrice: 50,
    stockQuantity: 100,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1580870059865-fb4d81226063?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_lip_gloss',
    name: 'Lip Gloss',
    brand: 'Generic',
    category: 'Makeup',
    sellerId: 's1',
    firstPrice: 30,
    lastPrice: 30,
    sellingPrice: 100,
    stockQuantity: 60,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_christina_baby_band',
    name: 'Christina Baby Band',
    brand: 'Christina',
    category: 'Hair',
    sellerId: 's1',
    firstPrice: 35,
    lastPrice: 35,
    sellingPrice: 100,
    stockQuantity: 40,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1580870059865-fb4d81226063?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_bless',
    name: 'BLESS',
    brand: 'Generic',
    category: 'Body',
    sellerId: 's1',
    firstPrice: 25,
    lastPrice: 25,
    sellingPrice: 100,
    stockQuantity: 50,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1599305090598-fe179d501227?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_beads_packet',
    name: 'Beads (Packet)',
    brand: 'Generic',
    category: 'Hair',
    sellerId: 's1',
    firstPrice: 50,
    lastPrice: 50,
    sellingPrice: 150,
    stockQuantity: 40,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1580870059865-fb4d81226063?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_rice_soap',
    name: 'Rice Soap',
    brand: 'Generic',
    category: 'Soaps',
    sellerId: 's1',
    firstPrice: 80,
    lastPrice: 80,
    sellingPrice: 150,
    stockQuantity: 35,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_vitamins',
    name: 'Vitamins',
    brand: 'Generic',
    category: 'Body',
    sellerId: 's1',
    firstPrice: 150,
    lastPrice: 150,
    sellingPrice: 300,
    stockQuantity: 20,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_brazilian_wool',
    name: 'Brazilian Wool',
    brand: 'Generic',
    category: 'Hair',
    sellerId: 's1',
    firstPrice: 50,
    lastPrice: 50,
    sellingPrice: 150,
    stockQuantity: 40,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_magic_lip_gloss',
    name: 'Magic Lip Gloss',
    brand: 'Generic',
    category: 'Makeup',
    sellerId: 's1',
    firstPrice: 30,
    lastPrice: 30,
    sellingPrice: 100,
    stockQuantity: 50,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_push_back_pearl',
    name: 'Push Back Pearl',
    brand: 'Generic',
    category: 'Nails',
    sellerId: 's1',
    firstPrice: 50,
    lastPrice: 50,
    sellingPrice: 150,
    stockQuantity: 30,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_hair_clip_flower',
    name: 'Hair Clip Flower',
    brand: 'Generic',
    category: 'Hair',
    sellerId: 's1',
    firstPrice: 40,
    lastPrice: 40,
    sellingPrice: 100,
    stockQuantity: 40,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1580870059865-fb4d81226063?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_scalp_spray',
    name: 'Scalp Spray',
    brand: 'Generic',
    category: 'Hair',
    sellerId: 's1',
    firstPrice: 80,
    lastPrice: 80,
    sellingPrice: 150,
    stockQuantity: 25,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_kojic_soap_new',
    name: 'Kojic Soap',
    brand: 'Generic',
    category: 'Soaps',
    sellerId: 's1',
    firstPrice: 150,
    lastPrice: 150,
    sellingPrice: 250,
    stockQuantity: 30,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_ponytail_headband',
    name: 'Ponytail headband',
    brand: 'Generic',
    category: 'Hair',
    sellerId: 's1',
    firstPrice: 200,
    lastPrice: 200,
    sellingPrice: 350,
    stockQuantity: 30,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1580870059865-fb4d81226063?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_korea_bls',
    name: 'Korea B.L.S.',
    brand: 'Generic',
    category: 'Hair',
    sellerId: 's1',
    firstPrice: 30,
    lastPrice: 30,
    sellingPrice: 100,
    stockQuantity: 50,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1580870059865-fb4d81226063?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_hairband_big',
    name: 'Hairband, big',
    brand: 'Generic',
    category: 'Hair',
    sellerId: 's1',
    firstPrice: 35,
    lastPrice: 35,
    sellingPrice: 100,
    stockQuantity: 40,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1580870059865-fb4d81226063?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_hair_caps_14',
    name: 'Hair caps, 14 clips',
    brand: 'Generic',
    category: 'Hair',
    sellerId: 's1',
    firstPrice: 140,
    lastPrice: 140,
    sellingPrice: 250,
    stockQuantity: 20,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1580870059865-fb4d81226063?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_chunky_ring',
    name: 'Chunky ring',
    brand: 'Generic',
    category: 'Accessories',
    sellerId: 's1',
    firstPrice: 70,
    lastPrice: 70,
    sellingPrice: 150,
    stockQuantity: 30,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1599305090598-fe179d501227?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_hair_clips',
    name: 'Hair clips',
    brand: 'Generic',
    category: 'Hair',
    sellerId: 's1',
    firstPrice: 65,
    lastPrice: 65,
    sellingPrice: 150,
    stockQuantity: 40,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1580870059865-fb4d81226063?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_sultana_coconut_oil',
    name: 'Sultana coconut oil',
    brand: 'Sultana',
    category: 'Hair',
    sellerId: 's1',
    firstPrice: 70,
    lastPrice: 70,
    sellingPrice: 150,
    stockQuantity: 30,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1611558709798-e009c8fd7706?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_nice_lovely_glycerine_60',
    name: 'Nice and lovely glycerine 60ml',
    brand: 'Nice & Lovely',
    category: 'Body',
    sellerId: 's1',
    firstPrice: 75,
    lastPrice: 75,
    sellingPrice: 150,
    stockQuantity: 25,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_nice_lovely_styling_gel_295',
    name: 'Nice and lovely styling gel 295 grams',
    brand: 'Nice & Lovely',
    category: 'Hair',
    sellerId: 's1',
    firstPrice: 350,
    lastPrice: 350,
    sellingPrice: 500,
    stockQuantity: 15,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_siri_works_80',
    name: 'Siri works 80 grams',
    brand: 'Siri',
    category: 'Hair',
    sellerId: 's1',
    firstPrice: 500,
    lastPrice: 500,
    sellingPrice: 700,
    stockQuantity: 10,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_venus_hair_food',
    name: 'Venus hair food',
    brand: 'Venus',
    category: 'Hair',
    sellerId: 's1',
    firstPrice: 250,
    lastPrice: 250,
    sellingPrice: 400,
    stockQuantity: 20,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_angelique_after_shave',
    name: 'Angelique after shave',
    brand: 'Angelique',
    category: 'Body',
    sellerId: 's1',
    firstPrice: 300,
    lastPrice: 300,
    sellingPrice: 450,
    stockQuantity: 15,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_ideal_olive_oil',
    name: 'Ideal olive oil',
    brand: 'Ideal',
    category: 'Hair',
    sellerId: 's1',
    firstPrice: 200,
    lastPrice: 200,
    sellingPrice: 350,
    stockQuantity: 20,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1611558709798-e009c8fd7706?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_turmeric_oil_200',
    name: 'Turmeric oil 200 milliliters',
    brand: 'Generic',
    category: 'Facial',
    sellerId: 's1',
    firstPrice: 200,
    lastPrice: 200,
    sellingPrice: 350,
    stockQuantity: 20,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1611558709798-e009c8fd7706?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_vaseline_jelly_95',
    name: 'Vaseline jelly 95 milliliters',
    brand: 'Vaseline',
    category: 'Body',
    sellerId: 's1',
    firstPrice: 150,
    lastPrice: 150,
    sellingPrice: 250,
    stockQuantity: 25,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1503236823255-94609f598e71?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_bamsi_hair_food_100',
    name: 'Bamsi hair food 100 grams',
    brand: 'Bamsi',
    category: 'Hair',
    sellerId: 's1',
    firstPrice: 90,
    lastPrice: 90,
    sellingPrice: 150,
    stockQuantity: 30,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_louron_toner_200',
    name: 'Louron toner 200 milliliters',
    brand: 'Louron',
    category: 'Facial',
    sellerId: 's1',
    firstPrice: 50,
    lastPrice: 50,
    sellingPrice: 150,
    stockQuantity: 25,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_dove_soap_blue',
    name: 'Dove soap blue',
    brand: 'Dove',
    category: 'Soaps',
    sellerId: 's1',
    firstPrice: 150,
    lastPrice: 150,
    sellingPrice: 250,
    stockQuantity: 30,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_turmeric_honey_soap',
    name: 'Turmeric with honey soap',
    brand: 'Generic',
    category: 'Soaps',
    sellerId: 's1',
    firstPrice: 150,
    lastPrice: 150,
    sellingPrice: 250,
    stockQuantity: 30,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_eyepencil',
    name: 'Eyepencil',
    brand: 'Generic',
    category: 'Makeup',
    sellerId: 's1',
    firstPrice: 30,
    lastPrice: 30,
    sellingPrice: 100,
    stockQuantity: 50,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_rexena_rollons',
    name: 'Rexena rollons',
    brand: 'Rexena',
    category: 'Body',
    sellerId: 's1',
    firstPrice: 300,
    lastPrice: 300,
    sellingPrice: 450,
    stockQuantity: 20,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_cotton_earbuds',
    name: 'Cotton earbuds',
    brand: 'Generic',
    category: 'Body',
    sellerId: 's1',
    firstPrice: 100,
    lastPrice: 100,
    sellingPrice: 200,
    stockQuantity: 40,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_foot_scruber',
    name: 'Foot scruber',
    brand: 'Generic',
    category: 'Body',
    sellerId: 's1',
    firstPrice: 200,
    lastPrice: 200,
    sellingPrice: 350,
    stockQuantity: 20,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_foot_smoother',
    name: 'Foot smoother',
    brand: 'Generic',
    category: 'Body',
    sellerId: 's1',
    firstPrice: 150,
    lastPrice: 150,
    sellingPrice: 250,
    stockQuantity: 25,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_mini_fan',
    name: 'Mini fan',
    brand: 'Generic',
    category: 'Accessories',
    sellerId: 's1',
    firstPrice: 350,
    lastPrice: 350,
    sellingPrice: 500,
    stockQuantity: 15,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1599305090598-fe179d501227?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_lip_balm',
    name: 'Lip balm',
    brand: 'Generic',
    category: 'Makeup',
    sellerId: 's1',
    firstPrice: 50,
    lastPrice: 50,
    sellingPrice: 150,
    stockQuantity: 40,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_brush',
    name: 'Brush',
    brand: 'Generic',
    category: 'Accessories',
    sellerId: 's1',
    firstPrice: 40,
    lastPrice: 40,
    sellingPrice: 100,
    stockQuantity: 50,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1599305090598-fe179d501227?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_lipstick_70',
    name: 'Lipstick',
    brand: 'Generic',
    category: 'Makeup',
    sellerId: 's1',
    firstPrice: 70,
    lastPrice: 70,
    sellingPrice: 150,
    stockQuantity: 40,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_neck_roll',
    name: 'Neck roll',
    brand: 'Generic',
    category: 'Accessories',
    sellerId: 's1',
    firstPrice: 350,
    lastPrice: 350,
    sellingPrice: 500,
    stockQuantity: 15,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1599305090598-fe179d501227?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_massage_oil_300',
    name: 'Massage oil (300ml)',
    brand: 'Generic',
    category: 'Body',
    sellerId: 's1',
    firstPrice: 150,
    lastPrice: 150,
    sellingPrice: 250,
    stockQuantity: 20,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1503236823255-94609f598e71?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_makeup_sponge',
    name: 'Makeup sponge',
    brand: 'Generic',
    category: 'Makeup',
    sellerId: 's1',
    firstPrice: 50,
    lastPrice: 50,
    sellingPrice: 100,
    stockQuantity: 50,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_cluster_lashes',
    name: 'Cluster lashes',
    brand: 'Generic',
    category: 'Makeup',
    sellerId: 's1',
    firstPrice: 100,
    lastPrice: 100,
    sellingPrice: 200,
    stockQuantity: 30,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_lashes_60',
    name: 'Lashes',
    brand: 'Generic',
    category: 'Makeup',
    sellerId: 's1',
    firstPrice: 60,
    lastPrice: 60,
    sellingPrice: 150,
    stockQuantity: 40,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_cusson_baby_oil_50',
    name: 'Cusson baby oil (50ml)',
    brand: 'Cusson',
    category: 'Body',
    sellerId: 's1',
    firstPrice: 165,
    lastPrice: 165,
    sellingPrice: 250,
    stockQuantity: 25,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1503236823255-94609f598e71?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_baby_powder_50',
    name: 'Baby Powder (50g)',
    brand: 'Generic',
    category: 'Body',
    sellerId: 's1',
    firstPrice: 175,
    lastPrice: 175,
    sellingPrice: 300,
    stockQuantity: 25,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1503236823255-94609f598e71?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_maga_leavein_234',
    name: 'Maga Leavein (234g)',
    brand: 'Maga',
    category: 'Hair',
    sellerId: 's1',
    firstPrice: 350,
    lastPrice: 350,
    sellingPrice: 500,
    stockQuantity: 15,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_maga_two_pack_chemical',
    name: 'Maga two pack chemical',
    brand: 'Maga',
    category: 'Hair',
    sellerId: 's1',
    firstPrice: 550,
    lastPrice: 550,
    sellingPrice: 800,
    stockQuantity: 10,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_miadi_activator_205',
    name: 'Miadi activator (205g)',
    brand: 'Miadi',
    category: 'Hair',
    sellerId: 's1',
    firstPrice: 200,
    lastPrice: 200,
    sellingPrice: 350,
    stockQuantity: 20,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_miadi_activator_105',
    name: 'Miadi activator (105g)',
    brand: 'Miadi',
    category: 'Hair',
    sellerId: 's1',
    firstPrice: 150,
    lastPrice: 150,
    sellingPrice: 250,
    stockQuantity: 20,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_movit_curl_gel_140',
    name: 'Movit curl gel (140g)',
    brand: 'Movit',
    category: 'Hair',
    sellerId: 's1',
    firstPrice: 100,
    lastPrice: 100,
    sellingPrice: 200,
    stockQuantity: 30,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_movit_relaxer',
    name: 'Movit relaxer',
    brand: 'Movit',
    category: 'Hair',
    sellerId: 's1',
    firstPrice: 140,
    lastPrice: 140,
    sellingPrice: 250,
    stockQuantity: 25,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_nice_lovely_lotion_200',
    name: 'Nice and lovely lotion (200ml)',
    brand: 'Nice & Lovely',
    category: 'Body',
    sellerId: 's1',
    firstPrice: 155,
    lastPrice: 155,
    sellingPrice: 250,
    stockQuantity: 20,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_movit_styling_gel_150',
    name: 'Movit styling gel (150g)',
    brand: 'Movit',
    category: 'Hair',
    sellerId: 's1',
    firstPrice: 150,
    lastPrice: 150,
    sellingPrice: 250,
    stockQuantity: 20,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_nice_lovely_pure_glycerin_100',
    name: 'Nice and lovely pure glycerin (100ml)',
    brand: 'Nice & Lovely',
    category: 'Body',
    sellerId: 's1',
    firstPrice: 180,
    lastPrice: 180,
    sellingPrice: 300,
    stockQuantity: 20,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_styling_gel_60',
    name: 'Styling gel (60g)',
    brand: 'Generic',
    category: 'Hair',
    sellerId: 's1',
    firstPrice: 100,
    lastPrice: 100,
    sellingPrice: 200,
    stockQuantity: 30,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_radiant_anti_druff_60',
    name: 'Radiant anti-druff (60g)',
    brand: 'Radiant',
    category: 'Hair',
    sellerId: 's1',
    firstPrice: 100,
    lastPrice: 100,
    sellingPrice: 200,
    stockQuantity: 30,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_roseleaf_pods',
    name: 'Roseleaf pods',
    brand: 'Generic',
    category: 'Facial',
    sellerId: 's1',
    firstPrice: 110,
    lastPrice: 110,
    sellingPrice: 200,
    stockQuantity: 25,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
    bestUsedBy: 'Dry skin, dull complexion',
    bestUsedWhen: 'At night before sleeping',
    bestUsedWith: 'Hydrating moisturizer',
    resultsAfter: 'Visible glow after 1 week'
  },
  {
    id: 'p_braid_jibambe_1',
    name: 'Jibambe Braid (Color 1)',
    brand: 'Jibambe',
    category: 'Braids',
    sellerId: 's1',
    firstPrice: 150,
    lastPrice: 150,
    sellingPrice: 300,
    stockQuantity: 50,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
    braidStyle: 'Knotless',
    braidLength: 'Long',
    braidType: 'Knotless',
    colorNumber: '1',
    bestUsedBy: 'Protective styling, knotless braids',
    resultsAfter: 'Can last up to 6 weeks'
  },
  {
    id: 'p_braid_jibambe_33',
    name: 'Jibambe Braid (Color 33)',
    brand: 'Jibambe',
    category: 'Braids',
    sellerId: 's1',
    firstPrice: 150,
    lastPrice: 150,
    sellingPrice: 300,
    stockQuantity: 45,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
    braidStyle: 'Box Braid',
    braidLength: 'Medium',
    braidType: 'Box Braid',
    colorNumber: '33',
    bestUsedBy: 'Protective styling, knotless braids',
    resultsAfter: 'Can last up to 6 weeks'
  },
  {
    id: 'p_braid_havana_27',
    name: 'Havana Curl (Color 27)',
    brand: 'Havana',
    category: 'Braids',
    sellerId: 's1',
    firstPrice: 200,
    lastPrice: 200,
    sellingPrice: 450,
    stockQuantity: 30,
    isFixedPrice: true,
    imageUrl: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400&h=400&fit=crop',
    createdAt: new Date().toISOString(),
    braidStyle: 'Havana Curl',
    braidLength: 'Long',
    braidType: 'Havana Curl',
    colorNumber: '27',
    bestUsedBy: 'Crochet styles, voluminous curls',
    bestUsedWith: 'Styling mousse for definition',
    resultsAfter: 'Can last 4-6 weeks with proper care'
  },
  { id: 'p_new_1000', name: 'Rosewater face toner', brand: 'Generic', category: 'Facial', sellerId: 's1', firstPrice: 130, lastPrice: 130, sellingPrice: 195, stockQuantity: 20, isFixedPrice: true, imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400&h=400&fit=crop', createdAt: '2026-01-15T00:00:00.000Z' },
  { id: 'p_new_1001', name: 'small nivea Deodrant 25ml', brand: 'Nivea', category: 'Body', sellerId: 's1', firstPrice: 180, lastPrice: 180, sellingPrice: 270, stockQuantity: 20, isFixedPrice: true, imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400&h=400&fit=crop', createdAt: '2026-01-15T00:00:00.000Z' },
  { id: 'p_new_1002', name: 'big nivea Deodrant 50ml', brand: 'Nivea', category: 'Body', sellerId: 's1', firstPrice: 250, lastPrice: 250, sellingPrice: 375, stockQuantity: 20, isFixedPrice: true, imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400&h=400&fit=crop', createdAt: '2026-01-15T00:00:00.000Z' },
  { id: 'p_new_1003', name: 'smart collection 15ml', brand: 'Smart Collection', category: 'Perfumes', sellerId: 's1', firstPrice: 130, lastPrice: 130, sellingPrice: 195, stockQuantity: 20, isFixedPrice: true, imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400&h=400&fit=crop', createdAt: '2026-01-15T00:00:00.000Z' },
  { id: 'p_new_1004', name: 'Nail Dye', brand: 'Generic', category: 'Nails', sellerId: 's1', firstPrice: 150, lastPrice: 150, sellingPrice: 225, stockQuantity: 20, isFixedPrice: true, imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400&h=400&fit=crop', createdAt: '2026-01-15T00:00:00.000Z' },
  { id: 'p_new_1005', name: 'Movit dye 60mls', brand: 'Movit', category: 'Hair', sellerId: 's1', firstPrice: 80, lastPrice: 80, sellingPrice: 120, stockQuantity: 20, isFixedPrice: true, imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400&h=400&fit=crop', createdAt: '2026-01-15T00:00:00.000Z' },
  { id: 'p_new_1006', name: 'Shower gloves', brand: 'Generic', category: 'Accessories', sellerId: 's1', firstPrice: 40, lastPrice: 40, sellingPrice: 60, stockQuantity: 20, isFixedPrice: true, imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400&h=400&fit=crop', createdAt: '2026-01-15T00:00:00.000Z' },
  { id: 'p_new_1007', name: 'Valon jelly', brand: 'Valon', category: 'Body', sellerId: 's1', firstPrice: 100, lastPrice: 100, sellingPrice: 150, stockQuantity: 20, isFixedPrice: true, imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400&h=400&fit=crop', createdAt: '2026-01-15T00:00:00.000Z' },
  { id: 'p_new_1008', name: 'Eyelashes strip', brand: 'Generic', category: 'Makeup', sellerId: 's1', firstPrice: 50, lastPrice: 50, sellingPrice: 75, stockQuantity: 20, isFixedPrice: true, imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400&h=400&fit=crop', createdAt: '2026-01-15T00:00:00.000Z' },
  { id: 'p_new_1009', name: 'Cluster eyelashes strip', brand: 'Generic', category: 'Makeup', sellerId: 's1', firstPrice: 100, lastPrice: 100, sellingPrice: 150, stockQuantity: 20, isFixedPrice: true, imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400&h=400&fit=crop', createdAt: '2026-01-15T00:00:00.000Z' },
  { id: 'p_new_1010', name: 'Pink sheen hairspray', brand: 'Generic', category: 'Hair', sellerId: 's1', firstPrice: 150, lastPrice: 150, sellingPrice: 225, stockQuantity: 20, isFixedPrice: true, imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400&h=400&fit=crop', createdAt: '2026-01-15T00:00:00.000Z' },
  { id: 'p_new_1011', name: 'Hair flower clips', brand: 'Generic', category: 'Accessories', sellerId: 's1', firstPrice: 65, lastPrice: 65, sellingPrice: 98, stockQuantity: 20, isFixedPrice: true, imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400&h=400&fit=crop', createdAt: '2026-01-15T00:00:00.000Z' },
  { id: 'p_new_1012', name: 'Body splash', brand: 'Generic', category: 'Perfumes', sellerId: 's1', firstPrice: 200, lastPrice: 200, sellingPrice: 300, stockQuantity: 20, isFixedPrice: true, imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400&h=400&fit=crop', createdAt: '2026-01-15T00:00:00.000Z' },
  { id: 'p_new_1013', name: 'Beaded chains', brand: 'Generic', category: 'Accessories', sellerId: 's1', firstPrice: 80, lastPrice: 80, sellingPrice: 120, stockQuantity: 20, isFixedPrice: true, imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400&h=400&fit=crop', createdAt: '2026-01-15T00:00:00.000Z' },
  { id: 'p_new_1014', name: 'Earring', brand: 'Generic', category: 'Accessories', sellerId: 's1', firstPrice: 50, lastPrice: 50, sellingPrice: 75, stockQuantity: 20, isFixedPrice: true, imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400&h=400&fit=crop', createdAt: '2026-01-15T00:00:00.000Z' },
  { id: 'p_new_1015', name: 'Bangles', brand: 'Generic', category: 'Accessories', sellerId: 's1', firstPrice: 35, lastPrice: 35, sellingPrice: 53, stockQuantity: 20, isFixedPrice: true, imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400&h=400&fit=crop', createdAt: '2026-01-15T00:00:00.000Z' },
  { id: 'p_new_1016', name: 'Anklets', brand: 'Generic', category: 'Accessories', sellerId: 's1', firstPrice: 35, lastPrice: 35, sellingPrice: 53, stockQuantity: 20, isFixedPrice: true, imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400&h=400&fit=crop', createdAt: '2026-01-15T00:00:00.000Z' },
  { id: 'p_new_1017', name: 'Gold chains', brand: 'Generic', category: 'Accessories', sellerId: 's1', firstPrice: 70, lastPrice: 70, sellingPrice: 105, stockQuantity: 20, isFixedPrice: true, imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400&h=400&fit=crop', createdAt: '2026-01-15T00:00:00.000Z' },
  { id: 'p_new_1018', name: 'Silver chains', brand: 'Generic', category: 'Accessories', sellerId: 's1', firstPrice: 50, lastPrice: 50, sellingPrice: 75, stockQuantity: 20, isFixedPrice: true, imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400&h=400&fit=crop', createdAt: '2026-01-15T00:00:00.000Z' },
  { id: 'p_new_1019', name: 'Earrings', brand: 'Generic', category: 'Accessories', sellerId: 's1', firstPrice: 30, lastPrice: 30, sellingPrice: 45, stockQuantity: 20, isFixedPrice: true, imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400&h=400&fit=crop', createdAt: '2026-01-15T00:00:00.000Z' },
  { id: 'p_new_1020', name: 'Set brushes', brand: 'Generic', category: 'Makeup', sellerId: 's1', firstPrice: 150, lastPrice: 150, sellingPrice: 225, stockQuantity: 20, isFixedPrice: true, imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400&h=400&fit=crop', createdAt: '2026-01-15T00:00:00.000Z' },
  { id: 'p_new_1021', name: 'Butterfly hair clips', brand: 'Generic', category: 'Accessories', sellerId: 's1', firstPrice: 300, lastPrice: 300, sellingPrice: 450, stockQuantity: 20, isFixedPrice: true, imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400&h=400&fit=crop', createdAt: '2026-01-15T00:00:00.000Z' },
  { id: 'p_new_1022', name: 'Primer', brand: 'Generic', category: 'Makeup', sellerId: 's1', firstPrice: 600, lastPrice: 600, sellingPrice: 900, stockQuantity: 20, isFixedPrice: true, imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400&h=400&fit=crop', createdAt: '2026-01-15T00:00:00.000Z' },
  { id: 'p_new_1023', name: 'Nail art', brand: 'Generic', category: 'Nails', sellerId: 's1', firstPrice: 360, lastPrice: 360, sellingPrice: 540, stockQuantity: 20, isFixedPrice: true, imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400&h=400&fit=crop', createdAt: '2026-01-15T00:00:00.000Z' },
  { id: 'p_new_1024', name: 'Wet wipes', brand: 'Generic', category: 'Skincare', sellerId: 's1', firstPrice: 30, lastPrice: 30, sellingPrice: 45, stockQuantity: 20, isFixedPrice: true, imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400&h=400&fit=crop', createdAt: '2026-01-15T00:00:00.000Z' },
  { id: 'p_new_1025', name: 'Face mask', brand: 'Generic', category: 'Facial', sellerId: 's1', firstPrice: 30, lastPrice: 30, sellingPrice: 45, stockQuantity: 20, isFixedPrice: true, imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400&h=400&fit=crop', createdAt: '2026-01-15T00:00:00.000Z' },
  { id: 'p_new_1026', name: 'Coin bag', brand: 'Generic', category: 'Accessories', sellerId: 's1', firstPrice: 50, lastPrice: 50, sellingPrice: 75, stockQuantity: 20, isFixedPrice: true, imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400&h=400&fit=crop', createdAt: '2026-01-15T00:00:00.000Z' },
  { id: 'p_new_1027', name: 'Eyebrow razor', brand: 'Generic', category: 'Accessories', sellerId: 's1', firstPrice: 50, lastPrice: 50, sellingPrice: 75, stockQuantity: 20, isFixedPrice: true, imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400&h=400&fit=crop', createdAt: '2026-01-15T00:00:00.000Z' },
  { id: 'p_new_1028', name: 'Mirror', brand: 'Generic', category: 'Accessories', sellerId: 's1', firstPrice: 50, lastPrice: 50, sellingPrice: 75, stockQuantity: 20, isFixedPrice: true, imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400&h=400&fit=crop', createdAt: '2026-01-15T00:00:00.000Z' },
  { id: 'p_new_1029', name: 'Concealer', brand: 'Generic', category: 'Makeup', sellerId: 's1', firstPrice: 60, lastPrice: 60, sellingPrice: 90, stockQuantity: 20, isFixedPrice: true, imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400&h=400&fit=crop', createdAt: '2026-01-15T00:00:00.000Z' },
  { id: 'p_new_1030', name: 'Fit me ponds', brand: 'Generic', category: 'Makeup', sellerId: 's1', firstPrice: 150, lastPrice: 150, sellingPrice: 225, stockQuantity: 20, isFixedPrice: true, imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400&h=400&fit=crop', createdAt: '2026-01-15T00:00:00.000Z' },
  { id: 'p_new_1031', name: 'Hand cream', brand: 'Generic', category: 'Skincare', sellerId: 's1', firstPrice: 60, lastPrice: 60, sellingPrice: 90, stockQuantity: 20, isFixedPrice: true, imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400&h=400&fit=crop', createdAt: '2026-01-15T00:00:00.000Z' },
  { id: 'p_new_1032', name: 'Lip gloss', brand: 'Generic', category: 'Makeup', sellerId: 's1', firstPrice: 20, lastPrice: 20, sellingPrice: 30, stockQuantity: 20, isFixedPrice: true, imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400&h=400&fit=crop', createdAt: '2026-01-15T00:00:00.000Z' },
  { id: 'p_new_1033', name: 'Eyepencil', brand: 'Generic', category: 'Makeup', sellerId: 's1', firstPrice: 20, lastPrice: 20, sellingPrice: 30, stockQuantity: 20, isFixedPrice: true, imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400&h=400&fit=crop', createdAt: '2026-01-15T00:00:00.000Z' },
  { id: 'p_new_1034', name: 'Lip gloss (2)', brand: 'Generic', category: 'Makeup', sellerId: 's1', firstPrice: 30, lastPrice: 30, sellingPrice: 45, stockQuantity: 20, isFixedPrice: true, imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400&h=400&fit=crop', createdAt: '2026-01-15T00:00:00.000Z' },
  { id: 'p_new_1035', name: 'art nail tube', brand: 'Generic', category: 'Nails', sellerId: 's1', firstPrice: 70, lastPrice: 70, sellingPrice: 105, stockQuantity: 20, isFixedPrice: true, imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400&h=400&fit=crop', createdAt: '2026-01-15T00:00:00.000Z' },
  { id: 'p_new_1036', name: 'Sleek f tube', brand: 'Generic', category: 'Makeup', sellerId: 's1', firstPrice: 60, lastPrice: 60, sellingPrice: 90, stockQuantity: 20, isFixedPrice: true, imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400&h=400&fit=crop', createdAt: '2026-01-15T00:00:00.000Z' },
  { id: 'p_new_1037', name: 'Keyholder', brand: 'Generic', category: 'Accessories', sellerId: 's1', firstPrice: 100, lastPrice: 100, sellingPrice: 150, stockQuantity: 20, isFixedPrice: true, imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400&h=400&fit=crop', createdAt: '2026-01-15T00:00:00.000Z' },
  { id: 'p_new_1038', name: 'Sponge s', brand: 'Generic', category: 'Accessories', sellerId: 's1', firstPrice: 15, lastPrice: 15, sellingPrice: 23, stockQuantity: 20, isFixedPrice: true, imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400&h=400&fit=crop', createdAt: '2026-01-15T00:00:00.000Z' },
  { id: 'p_new_1039', name: 'Sponge 2 round', brand: 'Generic', category: 'Accessories', sellerId: 's1', firstPrice: 20, lastPrice: 20, sellingPrice: 30, stockQuantity: 20, isFixedPrice: true, imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400&h=400&fit=crop', createdAt: '2026-01-15T00:00:00.000Z' },
  { id: 'p_new_1040', name: 'Mascara', brand: 'Generic', category: 'Makeup', sellerId: 's1', firstPrice: 70, lastPrice: 70, sellingPrice: 105, stockQuantity: 20, isFixedPrice: true, imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400&h=400&fit=crop', createdAt: '2026-01-15T00:00:00.000Z' },
  { id: 'p_new_1041', name: 'Sponge B', brand: 'Generic', category: 'Accessories', sellerId: 's1', firstPrice: 20, lastPrice: 20, sellingPrice: 30, stockQuantity: 20, isFixedPrice: true, imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400&h=400&fit=crop', createdAt: '2026-01-15T00:00:00.000Z' },
  { id: 'p_new_1042', name: 'Lip balm glitter', brand: 'Generic', category: 'Makeup', sellerId: 's1', firstPrice: 80, lastPrice: 80, sellingPrice: 120, stockQuantity: 20, isFixedPrice: true, imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400&h=400&fit=crop', createdAt: '2026-01-15T00:00:00.000Z' },
  { id: 'p_new_1043', name: 'Charm lip oil', brand: 'Generic', category: 'Makeup', sellerId: 's1', firstPrice: 180, lastPrice: 180, sellingPrice: 270, stockQuantity: 20, isFixedPrice: true, imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400&h=400&fit=crop', createdAt: '2026-01-15T00:00:00.000Z' },
  { id: 'p_new_1044', name: 'Lip oil assorted', brand: 'Generic', category: 'Makeup', sellerId: 's1', firstPrice: 80, lastPrice: 80, sellingPrice: 120, stockQuantity: 20, isFixedPrice: true, imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400&h=400&fit=crop', createdAt: '2026-01-15T00:00:00.000Z' },
  { id: 'p_new_1045', name: 'Eyeshadow', brand: 'Generic', category: 'Makeup', sellerId: 's1', firstPrice: 100, lastPrice: 100, sellingPrice: 150, stockQuantity: 20, isFixedPrice: true, imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400&h=400&fit=crop', createdAt: '2026-01-22T00:00:00.000Z' },
  { id: 'p_new_1046', name: 'Mascara gel', brand: 'Generic', category: 'Makeup', sellerId: 's1', firstPrice: 50, lastPrice: 50, sellingPrice: 75, stockQuantity: 20, isFixedPrice: true, imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400&h=400&fit=crop', createdAt: '2026-01-22T00:00:00.000Z' },
  { id: 'p_new_1047', name: 'Kids nail Art short', brand: 'Generic', category: 'Nails', sellerId: 's1', firstPrice: 33.33, lastPrice: 33.33, sellingPrice: 50, stockQuantity: 20, isFixedPrice: true, imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400&h=400&fit=crop', createdAt: '2026-01-22T00:00:00.000Z' },
  { id: 'p_new_1048', name: 'Baby sweet hairbands', brand: 'Generic', category: 'Accessories', sellerId: 's1', firstPrice: 40, lastPrice: 40, sellingPrice: 60, stockQuantity: 20, isFixedPrice: true, imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400&h=400&fit=crop', createdAt: '2026-01-22T00:00:00.000Z' },
  { id: 'p_new_1049', name: 'Spiral small hairband', brand: 'Generic', category: 'Accessories', sellerId: 's1', firstPrice: 20, lastPrice: 20, sellingPrice: 30, stockQuantity: 20, isFixedPrice: true, imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400&h=400&fit=crop', createdAt: '2026-01-22T00:00:00.000Z' },
  { id: 'p_new_1050', name: 'Bracelets', brand: 'Generic', category: 'Accessories', sellerId: 's1', firstPrice: 30, lastPrice: 30, sellingPrice: 45, stockQuantity: 20, isFixedPrice: true, imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400&h=400&fit=crop', createdAt: '2026-01-23T00:00:00.000Z' },
  { id: 'p_new_1051', name: 'Earrings beads', brand: 'Generic', category: 'Accessories', sellerId: 's1', firstPrice: 30, lastPrice: 30, sellingPrice: 45, stockQuantity: 20, isFixedPrice: true, imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400&h=400&fit=crop', createdAt: '2026-01-23T00:00:00.000Z' },
  { id: 'p_new_1052', name: 'Eyeliner pencil thin', brand: 'Generic', category: 'Makeup', sellerId: 's1', firstPrice: 20, lastPrice: 20, sellingPrice: 30, stockQuantity: 20, isFixedPrice: true, imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400&h=400&fit=crop', createdAt: '2026-01-23T00:00:00.000Z' },
  { id: 'p_new_1053', name: 'Bangles chains', brand: 'Generic', category: 'Accessories', sellerId: 's1', firstPrice: 50, lastPrice: 50, sellingPrice: 75, stockQuantity: 20, isFixedPrice: true, imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400&h=400&fit=crop', createdAt: '2026-01-23T00:00:00.000Z' },
  { id: 'p_new_1054', name: 'Chains', brand: 'Generic', category: 'Accessories', sellerId: 's1', firstPrice: 80, lastPrice: 80, sellingPrice: 120, stockQuantity: 20, isFixedPrice: true, imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400&h=400&fit=crop', createdAt: '2026-01-23T00:00:00.000Z' },
  { id: 'p_new_1055', name: 'Earrings (2)', brand: 'Generic', category: 'Accessories', sellerId: 's1', firstPrice: 50, lastPrice: 50, sellingPrice: 75, stockQuantity: 20, isFixedPrice: true, imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400&h=400&fit=crop', createdAt: '2026-01-23T00:00:00.000Z' },
  { id: 'p_new_1056', name: 'Nose string', brand: 'Generic', category: 'Accessories', sellerId: 's1', firstPrice: 5, lastPrice: 5, sellingPrice: 8, stockQuantity: 20, isFixedPrice: true, imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400&h=400&fit=crop', createdAt: '2026-01-23T00:00:00.000Z' },
  { id: 'p_new_1057', name: 'Earring small', brand: 'Generic', category: 'Accessories', sellerId: 's1', firstPrice: 5, lastPrice: 5, sellingPrice: 8, stockQuantity: 20, isFixedPrice: true, imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400&h=400&fit=crop', createdAt: '2026-01-23T00:00:00.000Z' },
  { id: 'p_new_1058', name: 'Small body splash', brand: 'Generic', category: 'Perfumes', sellerId: 's1', firstPrice: 100, lastPrice: 100, sellingPrice: 150, stockQuantity: 20, isFixedPrice: true, imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400&h=400&fit=crop', createdAt: '2026-01-23T00:00:00.000Z' },
  { id: 'p_new_1059', name: 'Baby care formula 200g', brand: 'Generic', category: 'Body', sellerId: 's1', firstPrice: 95, lastPrice: 95, sellingPrice: 143, stockQuantity: 20, isFixedPrice: true, imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400&h=400&fit=crop', createdAt: '2026-01-31T00:00:00.000Z' },
  { id: 'p_new_1060', name: 'Baby care formula 500g', brand: 'Generic', category: 'Body', sellerId: 's1', firstPrice: 20, lastPrice: 20, sellingPrice: 30, stockQuantity: 20, isFixedPrice: true, imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400&h=400&fit=crop', createdAt: '2026-01-31T00:00:00.000Z' },
  { id: 'p_new_1061', name: 'Nivea soft 200ml', brand: 'Nivea', category: 'Skincare', sellerId: 's1', firstPrice: 50, lastPrice: 50, sellingPrice: 75, stockQuantity: 20, isFixedPrice: true, imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400&h=400&fit=crop', createdAt: '2026-01-31T00:00:00.000Z' },
  { id: 'p_new_1062', name: 'Nivea sunscreen tube', brand: 'Nivea', category: 'Skincare', sellerId: 's1', firstPrice: 950, lastPrice: 950, sellingPrice: 1425, stockQuantity: 20, isFixedPrice: true, imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400&h=400&fit=crop', createdAt: '2026-01-31T00:00:00.000Z' },
  { id: 'p_new_1063', name: 'Phone accessory', brand: 'Generic', category: 'Accessories', sellerId: 's1', firstPrice: 80, lastPrice: 80, sellingPrice: 120, stockQuantity: 20, isFixedPrice: true, imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400&h=400&fit=crop', createdAt: '2026-01-31T00:00:00.000Z' },
  { id: 'p_new_1064', name: 'Sleek Concealer', brand: 'Generic', category: 'Makeup', sellerId: 's1', firstPrice: 55, lastPrice: 55, sellingPrice: 83, stockQuantity: 20, isFixedPrice: true, imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400&h=400&fit=crop', createdAt: '2026-01-31T00:00:00.000Z' },
  { id: 'p_new_1065', name: 'Veet remover', brand: 'Veet', category: 'Body', sellerId: 's1', firstPrice: 190, lastPrice: 190, sellingPrice: 285, stockQuantity: 20, isFixedPrice: true, imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400&h=400&fit=crop', createdAt: '2026-01-31T00:00:00.000Z' },
  { id: 'p_new_1066', name: 'Wooden beads', brand: 'Generic', category: 'Accessories', sellerId: 's1', firstPrice: 20, lastPrice: 20, sellingPrice: 30, stockQuantity: 20, isFixedPrice: true, imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400&h=400&fit=crop', createdAt: '2026-01-31T00:00:00.000Z' },
  { id: 'p_new_1067', name: 'Chunky ring', brand: 'Generic', category: 'Accessories', sellerId: 's1', firstPrice: 70, lastPrice: 70, sellingPrice: 105, stockQuantity: 20, isFixedPrice: true, imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400&h=400&fit=crop', createdAt: '2026-01-31T00:00:00.000Z' }
];

const MOCK_SALES: Sale[] = [
  {
    id: 's1',
    productId: '1',
    productName: 'Glow Facial Serum',
    brand: 'Dr Rashel',
    quantity: 1,
    sellingPrice: 35,
    buyingPrice: 18,
    profit: 17,
    paymentMethod: 'Mpesa',
    paymentStatus: 'Paid',
    amountPaid: 35,
    debtAmount: 0,
    staffId: 'u1',
    staffName: 'Alice',
    sellerName: 'Risper',
    createdAt: new Date().toISOString(),
  },
  {
    id: 's2',
    productId: '2',
    productName: 'Organic Rose Soap',
    brand: 'Nature Care',
    quantity: 2,
    sellingPrice: 12,
    buyingPrice: 6,
    profit: 12,
    paymentMethod: 'Cash',
    paymentStatus: 'Debt',
    amountPaid: 0,
    debtAmount: 24,
    staffId: 'u1',
    staffName: 'Alice',
    sellerName: 'Milka',
    createdAt: new Date().toISOString(),
  }
];

const MOCK_SELLERS: Seller[] = [
  {
    id: 's1',
    name: 'Beauty Wholesalers Ltd',
    productName: 'Glow Facial Serum',
    amount: 15,
    whatsappNumber: '254700000000',
    contact: '+254 700 000 000',
    dateAdded: new Date().toLocaleDateString(),
  },
  {
    id: 's2',
    name: 'Nature Care Supplies',
    productName: 'Organic Rose Soap',
    amount: 5,
    whatsappNumber: '254711111111',
    contact: '+254 711 111 111',
    dateAdded: new Date().toLocaleDateString(),
  },
  {
    id: 's3',
    name: 'Elite Cosmetics',
    productName: 'Glow Facial Serum',
    amount: 14,
    whatsappNumber: '254722222222',
    contact: '+254 722 222 222',
    dateAdded: new Date().toLocaleDateString(),
  }
];

const INITIAL_AGENTS = ['Employee 1', 'Employee 2'];

export default function App() {
  const [role, setRole] = useState<Role>('staff');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeEmployee, setActiveEmployee] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('sales');
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [braidFilters, setBraidFilters] = useState<BraidFilterState>(emptyBraidFilters());
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedProductForSale, setSelectedProductForSale] = useState<Product | null>(null);
  const [saleQuantity, setSaleQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>('Cash');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('Paid');
  const [amountPaid, setAmountPaid] = useState(0);
  const [selectedSeller, setSelectedSeller] = useState('Risper');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [discount, setDiscount] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [receiptSale, setReceiptSale] = useState<Sale | null>(null);
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [sales, setSales] = useState<Sale[]>(MOCK_SALES);
  const [sellers, setSellers] = useState<Seller[]>(MOCK_SELLERS);
  const [agents, setAgents] = useState<string[]>(INITIAL_AGENTS);
  const [isAddingSeller, setIsAddingSeller] = useState(false);
  const [editingSeller, setEditingSeller] = useState<Seller | null>(null);
  const [isAddingAgent, setIsAddingAgent] = useState(false);
  const [editingAgent, setEditingAgent] = useState<string | null>(null);
  const [newAgentName, setNewAgentName] = useState('');
  const [notification, setNotification] = useState<{ message: string, type: 'error' | 'success' } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ message: string, onConfirm: () => void } | null>(null);
  const [sellerFormData, setSellerFormData] = useState<Partial<Seller>>({
    name: '',
    productName: '',
    amount: 0,
    contact: '',
    whatsappNumber: ''
  });
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [loginMode, setLoginMode] = useState<'select' | 'pin'>('select');
  const [loginTarget, setLoginTarget] = useState<'admin' | 'Employee 1' | 'Employee 2' | null>(null);
  const EMP_PINS: Record<string, string> = { 'Employee 1': '1111', 'Employee 2': '2222' };
  const [requestedProducts, setRequestedProducts] = useState<RequestedProduct[]>([]);
  const [isRequestingProduct, setIsRequestingProduct] = useState(false);
  const [requestedProductName, setRequestedProductName] = useState('');

  // Storefront State
  const [showLogin, setShowLogin] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutCustomerName, setCheckoutCustomerName] = useState('');
  const [checkoutCustomerPhone, setCheckoutCustomerPhone] = useState('');
  const [checkoutPaymentMethod, setCheckoutPaymentMethod] = useState<PaymentMethod>('Mpesa');

  const ADMIN_PIN = '5063';

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Cart Logic
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stockQuantity) {
          showNotification('Not enough stock available', 'error');
          return prev;
        }
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1 }];
    });
    showNotification('Added to cart', 'success');
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQty = Math.max(1, Math.min(item.product.stockQuantity, item.quantity + delta));
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const cartTotalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.product.sellingPrice * item.quantity), 0);
  const cartDiscount = cartTotalItems >= 3 ? 20 : (cartTotalItems >= 2 ? 10 : 0);
  const cartTotal = cartSubtotal - cartDiscount;

  const handleCheckout = () => {
    if (cart.length === 0) return;

    let updatedProducts = [...products];

    const newSales: Sale[] = cart.map((item, index) => {
      const isFirstItem = index === 0;
      const itemDiscount = isFirstItem && cartDiscount > 0 ? cartDiscount : 0;
      const pIndex = updatedProducts.findIndex((p) => p.id === item.product.id);
      const product = pIndex >= 0 ? updatedProducts[pIndex] : item.product;
      const fifo = deductStockFIFO(product, item.quantity);

      if (pIndex >= 0) {
        updatedProducts[pIndex] = {
          ...product,
          stockQuantity: fifo.stockQuantity,
          stockUpdates: fifo.stockUpdates,
        };
      }

      const totalPrice = item.product.sellingPrice * item.quantity - itemDiscount;
      const totalProfit =
        (item.product.sellingPrice - fifo.consumedBuyingPrice) * item.quantity - itemDiscount;

      return {
        id: Math.random().toString(36).substr(2, 9),
        productId: item.product.id,
        productName: item.product.name,
        brand: item.product.brand,
        quantity: item.quantity,
        sellingPrice: item.product.sellingPrice,
        buyingPrice: fifo.consumedBuyingPrice,
        profit: totalProfit,
        paymentMethod: checkoutPaymentMethod,
        paymentStatus: 'Paid' as PaymentStatus,
        amountPaid: totalPrice,
        debtAmount: 0,
        staffId: 'online',
        staffName: 'Online Order',
        sellerName: 'Online',
        customerName: checkoutCustomerName.trim() || undefined,
        customerPhone: checkoutCustomerPhone.trim() || undefined,
        discount: itemDiscount > 0 ? itemDiscount : undefined,
        createdAt: new Date().toISOString(),
      };
    });

    setSales([...newSales, ...sales]);
    setProducts(updatedProducts);
    setCart([]);
    setIsCartOpen(false);
    setCheckoutCustomerName('');
    setCheckoutCustomerPhone('');
    showNotification('Order placed successfully!', 'success');
  };

  const visibleSales = useMemo(() => {
    if (role === 'admin') return sales;
    return sales.filter(s => s.staffName === activeEmployee);
  }, [sales, role, activeEmployee]);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'Braids') {
      return filterBraidProducts(products, braidFilters);
    }

    const result = products.filter((p) => {
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });

    return result.sort((a, b) => {
      const dateA = a.createdAt.split('T')[0];
      const dateB = b.createdAt.split('T')[0];
      if (dateA !== dateB) return dateB.localeCompare(dateA);
      return a.name.localeCompare(b.name);
    });
  }, [products, selectedCategory, searchQuery, braidFilters]);

  const weeklyTotals = useMemo(() => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const last7DaysSales = visibleSales.filter(s => new Date(s.createdAt) >= oneWeekAgo);

    const totals = last7DaysSales.reduce((acc, sale) => {
      acc.profit += sale.profit;
      acc.total += sale.amountPaid;
      return acc;
    }, { profit: 0, total: 0 });

    const byEmployee = last7DaysSales.reduce((acc, sale) => {
      const emp = sale.staffName || 'Unknown';
      if (!acc[emp]) acc[emp] = { total: 0, count: 0 };
      acc[emp].total += sale.amountPaid;
      acc[emp].count += 1;
      return acc;
    }, {} as Record<string, { total: number, count: number }>);

    return { ...totals, byEmployee };
  }, [visibleSales]);

  const monthlyTotals = useMemo(() => {
    const oneMonthAgo = new Date();
    oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
    const last30DaysSales = visibleSales.filter(s => new Date(s.createdAt) >= oneMonthAgo);

    const totals = last30DaysSales.reduce((acc, sale) => {
      acc.profit += sale.profit;
      acc.total += sale.amountPaid;
      return acc;
    }, { profit: 0, total: 0 });

    const byEmployee = last30DaysSales.reduce((acc, sale) => {
      const emp = sale.staffName || 'Unknown';
      if (!acc[emp]) acc[emp] = { total: 0, count: 0 };
      acc[emp].total += sale.amountPaid;
      acc[emp].count += 1;
      return acc;
    }, {} as Record<string, { total: number, count: number }>);

    return { ...totals, byEmployee };
  }, [visibleSales]);

  const yearlyTotals = useMemo(() => {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const last365DaysSales = visibleSales.filter(s => new Date(s.createdAt) >= oneYearAgo);

    const totals = last365DaysSales.reduce((acc, sale) => {
      acc.profit += sale.profit;
      acc.total += sale.amountPaid;
      return acc;
    }, { profit: 0, total: 0 });

    const byEmployee = last365DaysSales.reduce((acc, sale) => {
      const emp = sale.staffName || 'Unknown';
      if (!acc[emp]) acc[emp] = { total: 0, count: 0 };
      acc[emp].total += sale.amountPaid;
      acc[emp].count += 1;
      return acc;
    }, {} as Record<string, { total: number, count: number }>);

    return { ...totals, byEmployee };
  }, [visibleSales]);

  const dailyTotals = useMemo(() => {
    const filteredSales = visibleSales.filter(s => !selectedDate || s.createdAt.split('T')[0] === selectedDate);

    const totals = filteredSales.reduce((acc, sale) => {
      if (sale.paymentMethod === 'Cash') acc.cash += sale.amountPaid;
      if (sale.paymentMethod === 'Mpesa') acc.mpesa += sale.amountPaid;
      acc.total += sale.amountPaid;
      acc.profit += sale.profit;
      acc.totalSalesValue += (sale.sellingPrice * sale.quantity);
      return acc;
    }, { cash: 0, mpesa: 0, total: 0, profit: 0, totalSalesValue: 0 });

    const byEmployee = filteredSales.reduce((acc, sale) => {
      const emp = sale.staffName || 'Unknown';
      if (!acc[emp]) acc[emp] = { total: 0, count: 0 };
      acc[emp].total += sale.amountPaid;
      acc[emp].count += 1;
      return acc;
    }, {} as Record<string, { total: number, count: number }>);

    return { ...totals, byEmployee };
  }, [visibleSales, selectedDate]);

  const trendData = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const dateStr = date.toISOString().split('T')[0];
      const daySales = visibleSales.filter(s => s.createdAt.startsWith(dateStr));
      const salesVol = daySales.reduce((sum, s) => sum + s.sellingPrice * s.quantity, 0);
      const profit = daySales.reduce((sum, s) => sum + s.profit, 0);
      return {
        name: date.toLocaleDateString('en-US', { weekday: 'short' }),
        sales: salesVol,
        profit: profit
      };
    });
  }, [visibleSales]);

  const stats = useMemo(() => {
    const totalRevenue = visibleSales.reduce((sum, s) => sum + (s.sellingPrice * s.quantity), 0);
    const totalSales = visibleSales.length;
    const inventoryCount = products.reduce((sum, p) => sum + p.stockQuantity, 0);
    const totalProfit = visibleSales.reduce((sum, s) => sum + s.profit, 0);
    const lowStockCount = products.filter(p => p.stockQuantity <= LOW_STOCK_THRESHOLD).length;
    const highStockCount = products.filter(p => p.stockQuantity >= HIGH_STOCK_THRESHOLD).length;
    return { totalRevenue, totalSales, inventoryCount, totalProfit, lowStockCount, highStockCount };
  }, [visibleSales, products]);

  const performanceStats = useMemo(() => {
    return products.map(product => {
      const unitsSold = visibleSales.filter(s => s.productId === product.id).reduce((sum, s) => sum + s.quantity, 0);
      const totalUnits = unitsSold + product.stockQuantity;
      const performance = totalUnits > 0 ? (unitsSold / totalUnits) * 100 : 0;
      return {
        ...product,
        performance: Math.round(performance)
      };
    }).sort((a, b) => b.performance - a.performance);
  }, [products, sales]);

  const handleRecordSale = () => {
    if (!selectedProductForSale || !paymentMethod) return;

    if (paymentStatus === 'Debt' && !customerName.trim()) {
      showNotification('Customer name (Debt Owner) is required for debts.', 'error');
      return;
    }

    const fifo = deductStockFIFO(selectedProductForSale, saleQuantity);
    const totalPrice = selectedProductForSale.sellingPrice * saleQuantity - discount;
    const debtAmount = totalPrice - amountPaid;
    const totalProfit =
      (selectedProductForSale.sellingPrice - fifo.consumedBuyingPrice) * saleQuantity - discount;

    const newSale: Sale = {
      id: Math.random().toString(36).substr(2, 9),
      productId: selectedProductForSale.id,
      productName: selectedProductForSale.name,
      brand: selectedProductForSale.brand,
      quantity: saleQuantity,
      sellingPrice: selectedProductForSale.sellingPrice,
      buyingPrice: fifo.consumedBuyingPrice,
      profit: totalProfit,
      paymentMethod: paymentMethod,
      paymentStatus: paymentStatus,
      amountPaid: amountPaid,
      debtAmount: Math.max(0, debtAmount),
      staffId: 'u1',
      staffName: activeEmployee || 'Staff',
      sellerName: role === 'admin' ? selectedSeller : (activeEmployee || selectedSeller),
      customerName: customerName.trim() || undefined,
      customerPhone: customerPhone.trim() || undefined,
      discount: discount > 0 ? discount : undefined,
      createdAt: new Date().toISOString(),
    };

    setSales([newSale, ...sales]);
    setProducts(products.map(p => {
      if (p.id === selectedProductForSale.id) {
        return {
          ...p,
          stockQuantity: fifo.stockQuantity,
          stockUpdates: fifo.stockUpdates,
        };
      }
      return p;
    }));
    setSelectedProductForSale(null);
    setSaleQuantity(1);
    setAmountPaid(0);
    setPaymentStatus('Paid');
    setCustomerName('');
    setCustomerPhone('');
    setDiscount(0);
    setReceiptSale(newSale); // Show receipt after sale
  };

  const handleClearDebt = (saleId: string) => {
    setSales(sales.map(s => {
      if (s.id === saleId) {
        return {
          ...s,
          paymentStatus: 'Paid',
          amountPaid: s.sellingPrice * s.quantity,
          debtAmount: 0,
          clearedAt: new Date().toISOString()
        };
      }
      return s;
    }));
  };

  const showNotification = (message: string, type: 'error' | 'success' = 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSaveSeller = () => {
    if (!sellerFormData.name || !sellerFormData.productName) return;

    if (editingSeller) {
      setSellers(sellers.map(s => s.id === editingSeller.id ? { ...s, ...sellerFormData } as Seller : s));
      showNotification('Wholesaler updated successfully', 'success');
    } else {
      const newSeller: Seller = {
        id: Math.random().toString(36).substr(2, 9),
        name: sellerFormData.name || '',
        productName: sellerFormData.productName || '',
        amount: sellerFormData.amount || 0,
        contact: sellerFormData.contact || '',
        whatsappNumber: sellerFormData.whatsappNumber || '',
        dateAdded: new Date().toLocaleDateString()
      };
      setSellers([...sellers, newSeller]);
      showNotification('Wholesaler added successfully', 'success');
    }
    setIsAddingSeller(false);
    setEditingSeller(null);
    setSellerFormData({ name: '', productName: '', amount: 0, contact: '', whatsappNumber: '' });
  };

  const handleDeleteSeller = (id: string) => {
    setConfirmDialog({
      message: 'Are you sure you want to delete this wholesaler?',
      onConfirm: () => {
        setSellers(sellers.filter(s => s.id !== id));
        showNotification('Wholesaler deleted', 'success');
        setConfirmDialog(null);
      }
    });
  };

  const handleAddAgent = () => {
    if (!newAgentName.trim()) return;

    if (editingAgent) {
      if (agents.includes(newAgentName.trim()) && newAgentName.trim() !== editingAgent) {
        showNotification('Agent name already exists');
        return;
      }
      setAgents(agents.map(a => a === editingAgent ? newAgentName.trim() : a));
      if (selectedSeller === editingAgent) {
        setSelectedSeller(newAgentName.trim());
      }
      showNotification('Agent updated', 'success');
    } else {
      if (agents.includes(newAgentName.trim())) {
        showNotification('Agent already exists');
        return;
      }
      setAgents([...agents, newAgentName.trim()]);
      showNotification('Agent added successfully', 'success');
    }

    setNewAgentName('');
    setIsAddingAgent(false);
    setEditingAgent(null);
  };

  const handleDeleteAgent = (name: string) => {
    if (name === 'Staff') {
      showNotification('Cannot delete the default Staff agent');
      return;
    }
    setConfirmDialog({
      message: `Are you sure you want to delete agent "${name}"?`,
      onConfirm: () => {
        setAgents(agents.filter(a => a !== name));
        if (selectedSeller === name) {
          setSelectedSeller('Staff');
        }
        showNotification('Agent deleted', 'success');
        setConfirmDialog(null);
      }
    });
  };

  const handleEditAgent = (oldName: string) => {
    setEditingAgent(oldName);
    setNewAgentName(oldName);
    setIsAddingAgent(true);
  };

  const getStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case 'Debt': return 'text-red-600 font-bold';
      case 'Deposit': return 'text-green-600 font-bold';
      case 'Paid': return 'text-black font-medium';
      default: return 'text-gray-600';
    }
  };

  const PAGE_TITLES: Record<string, string> = {
    dashboard: 'Dashboard',
    braids: 'Braids',
    summary: 'Sales Summary',
    inventory: role === 'admin' ? 'Inventory' : 'Stock Check',
    sellers: 'Sellers',
    reports: 'Profit Reports',
    sales: 'Sales History',
  };

  const NavItem = ({ id, icon: Icon, label }: { id: string; icon: React.ComponentType<{ size?: number }>; label: string }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm ${
        activeTab === id
          ? 'bg-pink-500 text-white font-semibold shadow-lg shadow-pink-500/30'
          : 'text-gray-400 hover:bg-white/10 hover:text-white'
      }`}
    >
      <Icon size={18} />
      <span>{label}</span>
    </button>
  );

  const NavSection = ({ title }: { title: string }) => (
    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-4 pt-4 pb-1">{title}</p>
  );

  const QuickAction = ({
    icon: Icon,
    label,
    desc,
    onClick,
  }: {
    icon: React.ComponentType<{ size?: number }>;
    label: string;
    desc: string;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className="bg-white border border-gray-100 rounded-2xl p-5 text-left hover:border-pink-300 hover:shadow-lg hover:shadow-pink-100/50 transition-all group"
    >
      <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-pink-500 mb-3 group-hover:bg-pink-500 group-hover:text-white transition-colors">
        <Icon size={20} />
      </div>
      <p className="font-bold text-gray-900 text-sm">{label}</p>
      <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
    </button>
  );

  if (!isAuthenticated) {
    if (!showLogin) {
      return (
        <>
          <Storefront
            products={products}
            cart={cart}
            addToCart={addToCart}
            removeFromCart={removeFromCart}
            updateCartQuantity={updateCartQuantity}
            cartTotalItems={cartTotalItems}
            cartSubtotal={cartSubtotal}
            cartDiscount={cartDiscount}
            cartTotal={cartTotal}
            isCartOpen={isCartOpen}
            setIsCartOpen={setIsCartOpen}
            checkoutCustomerName={checkoutCustomerName}
            setCheckoutCustomerName={setCheckoutCustomerName}
            checkoutCustomerPhone={checkoutCustomerPhone}
            setCheckoutCustomerPhone={setCheckoutCustomerPhone}
            checkoutPaymentMethod={checkoutPaymentMethod}
            setCheckoutPaymentMethod={setCheckoutPaymentMethod}
            handleCheckout={handleCheckout}
            onAdminLoginClick={() => setShowLogin(true)}
          />
          {/* Notification Toast */}
          <AnimatePresence>
            {notification && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-bold text-sm ${notification.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                  }`}
              >
                {notification.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                {notification.message}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      );
    }

    return (
      <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
        {/* Background Image with Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1974&auto=format&fit=crop")' }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 bg-white/95 backdrop-blur-md p-8 rounded-[40px] shadow-2xl w-full max-w-md border border-white/20 text-center"
        >
          <button
            onClick={() => setShowLogin(false)}
            className="absolute top-6 left-6 p-2 text-gray-400 hover:text-pink-500 transition-colors bg-white rounded-full shadow-sm"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="w-24 h-24 bg-black rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-black/20 mt-4 overflow-hidden">
            <img src="/logo.jpg" alt="BLUMERA Logo" className="w-full h-full object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling!.classList.remove('hidden'); }} />
            <span className="text-pink-500 text-5xl font-black hidden">B</span>
          </div>

          <h1 className="text-4xl font-display font-black text-gray-900 mb-1">{BRAND.systemName}</h1>
          <p className="text-pink-500 font-bold text-sm tracking-wide mb-1">{BRAND.tagline}</p>
          <p className="text-gray-500 font-medium text-lg mb-8">{BRAND.shopName}</p>

          <AnimatePresence mode="wait">
            {loginMode === 'select' ? (
              <motion.div
                key="select"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <p className="text-gray-500 mb-6 font-medium">Please select your role to continue</p>

                <button
                  onClick={() => {
                    setLoginTarget('Employee 1');
                    setLoginMode('pin');
                  }}
                  className="w-full flex items-center justify-between p-6 bg-pink-50 rounded-3xl hover:bg-pink-100 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-pink-500 shadow-sm">
                      <Users size={24} />
                    </div>
                    <div className="text-left">
                      <p className="font-black text-gray-800">Employee 1</p>
                      <p className="text-xs text-gray-400">Record sales · check stock</p>
                    </div>
                  </div>
                  <ChevronRight className="text-pink-300 group-hover:text-pink-500 transition-colors" />
                </button>

                <button
                  onClick={() => {
                    setLoginTarget('Employee 2');
                    setLoginMode('pin');
                  }}
                  className="w-full flex items-center justify-between p-6 bg-pink-50 rounded-3xl hover:bg-pink-100 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-pink-500 shadow-sm">
                      <Users size={24} />
                    </div>
                    <div className="text-left">
                      <p className="font-black text-gray-800">Employee 2</p>
                      <p className="text-xs text-gray-400">Record sales · check stock</p>
                    </div>
                  </div>
                  <ChevronRight className="text-pink-300 group-hover:text-pink-500 transition-colors" />
                </button>

                <button
                  onClick={() => {
                    setLoginTarget('admin');
                    setLoginMode('pin');
                  }}
                  className="w-full flex items-center justify-between p-6 bg-gray-50 rounded-3xl hover:bg-gray-100 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-500 shadow-sm">
                      <Lock size={24} />
                    </div>
                    <div className="text-left">
                      <p className="font-black text-gray-800">Administrator</p>
                      <p className="text-xs text-gray-400">Full system access</p>
                    </div>
                  </div>
                  <ChevronRight className="text-gray-300 group-hover:text-gray-500 transition-colors" />
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="pin"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <button
                    onClick={() => setLoginMode('select')}
                    className="p-2 hover:bg-gray-100 rounded-xl text-gray-400"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <p className="text-gray-500 font-medium">Enter {loginTarget === 'admin' ? 'Admin' : loginTarget} PIN</p>
                </div>

                <div className="flex justify-center gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-12 h-16 rounded-2xl border-2 flex items-center justify-center text-2xl font-black transition-all ${pin.length > i ? 'border-pink-500 bg-pink-50 text-pink-600' : 'border-pink-100 text-gray-200'}`}
                    >
                      {pin.length > i ? '•' : ''}
                    </div>
                  ))}
                </div>

                <input
                  type="password"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setPin(val);
                    const isSuccess = loginTarget === 'admin' ? val === ADMIN_PIN : (loginTarget && val === EMP_PINS[loginTarget]);
                    if (isSuccess) {
                      setRole(loginTarget === 'admin' ? 'admin' : 'staff');
                      setIsAdminAuthenticated(loginTarget === 'admin');
                      setActiveEmployee(loginTarget === 'admin' ? null : loginTarget);
                      setIsAuthenticated(true);
                      setPin('');
                    } else if (val.length === 4) {
                      showNotification('Incorrect PIN');
                      setPin('');
                    }
                  }}
                  autoFocus
                  className="absolute opacity-0 pointer-events-none"
                />

                <div className="grid grid-cols-3 gap-4 pt-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, '←'].map((num, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        if (num === 'C') setPin('');
                        else if (num === '←') setPin(pin.slice(0, -1));
                        else if (typeof num === 'number' && pin.length < 4) {
                          const newVal = pin + num;
                          setPin(newVal);
                          const isSuccess = loginTarget === 'admin' ? newVal === ADMIN_PIN : (loginTarget && newVal === EMP_PINS[loginTarget]);
                          if (isSuccess) {
                            setRole(loginTarget === 'admin' ? 'admin' : 'staff');
                            setIsAdminAuthenticated(loginTarget === 'admin');
                            setActiveEmployee(loginTarget === 'admin' ? null : loginTarget);
                            setIsAuthenticated(true);
                            setPin('');
                          } else if (newVal.length === 4) {
                            showNotification('Incorrect PIN');
                            setPin('');
                          }
                        }
                      }}
                      className="h-16 rounded-2xl bg-pink-50 text-xl font-black text-pink-600 hover:bg-pink-100 active:scale-95 transition-all"
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex text-gray-800 font-sans">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 260 : 0, opacity: isSidebarOpen ? 1 : 0 }}
        className="admin-sidebar border-r border-gray-800 overflow-hidden flex flex-col shrink-0"
      >
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-pink-500 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-pink-500/40">
              B
            </div>
            <div>
              <h1 className="text-lg font-display font-black text-white whitespace-nowrap">{BRAND.systemName}</h1>
              <p className="text-[10px] text-pink-400 font-bold">{BRAND.tagline}</p>
            </div>
          </div>
          <p className="text-[10px] text-gray-500 pl-[52px]">{BRAND.shopName}</p>
        </div>

        <nav className="flex-1 px-3 space-y-0.5 mt-2 overflow-y-auto">
          <NavSection title="Overview" />
          <NavItem id="dashboard" icon={LayoutDashboard} label="Dashboard" />
          <NavItem id="braids" icon={Scissors} label="Braids" />
          <NavItem id="sales" icon={ShoppingCart} label="Sales History" />

          {role === 'admin' ? (
            <>
              <NavSection title="Management" />
              <NavItem id="inventory" icon={Package} label="Inventory" />
              <NavItem id="sellers" icon={Users} label="Sellers" />
              <NavSection title="Reports" />
              <NavItem id="summary" icon={TrendingUp} label="Sales Summary" />
              <NavItem id="reports" icon={BarChart3} label="Profit Reports" />
            </>
          ) : (
            <>
              <NavSection title="Stock" />
              <NavItem id="inventory" icon={Package} label="Stock Check" />
            </>
          )}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={() => {
              setIsAuthenticated(false);
              setIsAdminAuthenticated(false);
              setLoginMode('select');
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-white/10 hover:text-white transition-all font-medium text-sm"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden admin-main">
        <header className="h-[72px] bg-white border-b border-gray-100 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-xl text-gray-700 transition-all"
            >
              <Menu size={22} />
            </button>
            <div>
              <h2 className="text-xl font-display font-black text-gray-900">
                {PAGE_TITLES[activeTab] || 'Dashboard'}
              </h2>
              <p className="text-xs text-gray-500">
                {BRAND.systemName} · <span className="text-pink-500 font-semibold capitalize">{role === 'admin' ? 'Admin' : activeEmployee || 'Staff'}</span>
              </p>
            </div>
          </div>

          {(activeTab === 'dashboard' || activeTab === 'inventory' || activeTab === 'braids') && (
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-pink-300 outline-none w-56"
              />
            </div>
          )}
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                {role === 'admin' && (
                  <>
                    {/* Low Stock Alert Banner */}
                    {stats.lowStockCount > 0 && (
                      <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-3 text-amber-700">
                          <AlertTriangle size={24} className="text-amber-500" />
                          <div>
                            <p className="font-bold">Low Stock Alert</p>
                            <p className="text-sm">You have {stats.lowStockCount} product{stats.lowStockCount === 1 ? '' : 's'} running low on stock.</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setActiveTab('inventory')}
                          className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-700 text-sm font-bold rounded-xl transition-colors"
                        >
                          View Inventory
                        </button>
                      </div>
                    )}

                    {/* High Stock Alert Banner */}
                    {stats.highStockCount > 0 && (
                      <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-3 text-blue-700">
                          <TrendingUp size={24} className="text-blue-500" />
                          <div>
                            <p className="font-bold">High Stock Alert</p>
                            <p className="text-sm">You have {stats.highStockCount} product{stats.highStockCount === 1 ? '' : 's'} with high stock quantities.</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setActiveTab('inventory')}
                          className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 text-sm font-bold rounded-xl transition-colors"
                        >
                          View Inventory
                        </button>
                      </div>
                    )}

                    {/* Quick navigation */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      <QuickAction icon={Package} label="Inventory" desc="Add & manage products" onClick={() => setActiveTab('inventory')} />
                      <QuickAction icon={Scissors} label="Braids" desc="Filter braid catalog" onClick={() => setActiveTab('braids')} />
                      <QuickAction icon={TrendingUp} label="Sales Summary" desc="Revenue overview" onClick={() => setActiveTab('summary')} />
                      <QuickAction icon={BarChart3} label="Profit Reports" desc="Margin analytics" onClick={() => setActiveTab('reports')} />
                      <QuickAction icon={ShoppingCart} label="Sales History" desc="All transactions" onClick={() => setActiveTab('sales')} />
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="bg-white p-6 rounded-[32px] shadow-sm border border-pink-100 flex items-center gap-4">
                        <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-500">
                          <TrendingUp size={24} />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 font-bold uppercase">Total Revenue</p>
                          <p className="text-xl font-black text-gray-800">KSh {stats.totalRevenue}</p>
                        </div>
                      </div>
                      <div className="bg-white p-6 rounded-[32px] shadow-sm border border-pink-100 flex items-center gap-4">
                        <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-500">
                          <ShoppingBag size={24} />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 font-bold uppercase">Total Sales</p>
                          <p className="text-xl font-black text-gray-800">{stats.totalSales}</p>
                        </div>
                      </div>
                      <div className="bg-white p-6 rounded-[32px] shadow-sm border border-pink-100 flex items-center gap-4">
                        <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-500">
                          <Package size={24} />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 font-bold uppercase">Inventory</p>
                          <p className="text-xl font-black text-gray-800">{stats.inventoryCount}</p>
                        </div>
                      </div>
                      <div className="bg-white p-6 rounded-[32px] shadow-sm border border-pink-100 flex items-center gap-4">
                        <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-500">
                          <Users size={24} />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 font-bold uppercase">Total Profit</p>
                          <p className="text-xl font-black text-gray-800">KSh {stats.totalProfit}</p>
                        </div>
                      </div>
                    </div>

                    {/* Sales Trend Chart */}
                    <div className="bg-white p-8 rounded-[40px] shadow-sm border border-pink-100">
                      <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-500 shadow-sm border border-pink-100">
                          <TrendingUp size={24} />
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-gray-800">Sales Trend</h3>
                          <p className="text-sm text-gray-400 font-medium">Last 7 Days</p>
                        </div>
                      </div>
                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={trendData}>
                            <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip
                              contentStyle={{ borderRadius: '16px', border: '1px solid #fbcfe8', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                              cursor={{ stroke: '#fbcfe8', strokeWidth: 2, strokeDasharray: '4 4' }}
                            />
                            <Line type="monotone" dataKey="sales" name="Sales (KSh)" stroke="#f472b6" strokeWidth={3} dot={{ fill: '#f472b6', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                            <Line type="monotone" dataKey="profit" name="Profit (KSh)" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Fast Moving Products Section */}
                    <div className="bg-white p-8 rounded-[40px] shadow-sm border border-pink-100">
                      <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 bg-pink-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-pink-100">
                          <Zap size={24} />
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-gray-800">Fast Moving Products</h3>
                          <p className="text-sm text-gray-400 font-medium">Performance based on sales vs inventory</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {performanceStats.slice(0, 6).map((product, i) => (
                          <div key={product.id} className="bg-pink-50/30 p-6 rounded-3xl relative overflow-hidden group">
                            <div className="flex items-center gap-4 mb-4">
                              <img src={product.imageUrl} className="w-16 h-16 rounded-2xl object-cover shadow-md" referrerPolicy="no-referrer" />
                              <div className="flex-1">
                                <p className="text-sm font-black text-gray-800 line-clamp-1">{product.name}</p>
                                <p className="text-[10px] font-bold text-pink-400 uppercase tracking-wider">{product.brand}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-black text-pink-600">{product.performance}%</p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase">Performance</p>
                              </div>
                            </div>
                            <div className="w-full h-2 bg-white rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${product.performance}%` }}
                                className={`h-full ${product.performance > 75 ? 'bg-emerald-500' : product.performance > 40 ? 'bg-pink-500' : 'bg-gray-300'}`}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Daily Summary */}
                    <div className="bg-white p-8 rounded-[40px] shadow-sm border border-pink-100">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-500">
                            <CalendarIcon size={24} />
                          </div>
                          <div>
                            <h3 className="text-xl font-black text-gray-800">Daily Summary</h3>
                            <p className="text-sm text-gray-400">{new Date(selectedDate || new Date()).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                          </div>
                        </div>
                        <div className="relative group">
                          <button className="p-3 bg-pink-50 text-pink-500 rounded-2xl hover:bg-pink-100 transition-all">
                            <CalendarIcon size={20} />
                          </button>
                          <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-pink-50/50 p-6 rounded-3xl flex items-center gap-4">
                          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-pink-500 shadow-sm">
                            <Banknote size={24} />
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 uppercase font-bold">Cash</p>
                            <p className="text-xl font-black text-gray-700">KSh {dailyTotals.cash}</p>
                          </div>
                        </div>
                        <div className="bg-pink-50/50 p-6 rounded-3xl flex items-center gap-4">
                          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-pink-500 shadow-sm">
                            <CreditCard size={24} />
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 uppercase font-bold">Mpesa</p>
                            <p className="text-xl font-black text-gray-700">KSh {dailyTotals.mpesa}</p>
                          </div>
                        </div>
                        <div className="bg-pink-600 p-6 rounded-3xl flex items-center gap-4 text-white shadow-lg shadow-pink-100">
                          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white">
                            <TrendingUp size={24} />
                          </div>
                          <div>
                            <p className="text-xs text-white/70 uppercase font-bold">Grand Total</p>
                            <p className="text-xl font-black">KSh {dailyTotals.total}</p>
                          </div>
                        </div>
                        <div className="bg-emerald-500 p-6 rounded-3xl flex items-center gap-4 text-white shadow-lg shadow-emerald-100">
                          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white">
                            <DollarSign size={24} />
                          </div>
                          <div>
                            <p className="text-xs text-emerald-100 uppercase font-bold">Daily Profit</p>
                            <p className="text-xl font-black">KSh {dailyTotals.profit}</p>
                          </div>
                        </div>
                      </div>

                      {/* Employee Breakdown */}
                      {(Object.entries(dailyTotals.byEmployee).length > 0 || Object.entries(weeklyTotals.byEmployee).length > 0) && (
                        <div className="mt-6 pt-6 border-t border-pink-50">
                          <h4 className="text-sm font-bold text-gray-600 mb-4 uppercase">Sales by Employee (Daily & Weekly)</h4>
                          <div className="overflow-x-auto">
                            <table className="w-full text-left">
                              <thead className="bg-pink-50/50 text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                                <tr>
                                  <th className="px-4 py-3 rounded-l-xl">Employee</th>
                                  <th className="px-4 py-3">Today's Sales</th>
                                  <th className="px-4 py-3 rounded-r-xl">Last 7 Days</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-pink-50">
                                {Array.from(new Set([...Object.keys(dailyTotals.byEmployee), ...Object.keys(weeklyTotals.byEmployee)])).map((emp) => {
                                  const daily = dailyTotals.byEmployee[emp] || { total: 0, count: 0 };
                                  const weekly = weeklyTotals.byEmployee[emp] || { total: 0, count: 0 };
                                  return (
                                    <tr key={emp} className="hover:bg-pink-50/30 transition-colors">
                                      <td className="px-4 py-3 text-sm font-bold text-gray-800">{emp}</td>
                                      <td className="px-4 py-3 text-sm font-bold text-emerald-600">
                                        KSh {daily.total} <span className="text-[10px] font-medium text-gray-400 ml-1">({daily.count} sales)</span>
                                      </td>
                                      <td className="px-4 py-3 text-sm font-bold text-pink-600">
                                        KSh {weekly.total} <span className="text-[10px] font-medium text-gray-400 ml-1">({weekly.count} sales)</span>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {role === 'staff' && (
                  <div className="space-y-6">
                    <div className="bg-black text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-48 h-48 bg-pink-500/20 rounded-full blur-3xl" />
                      <div className="relative">
                        <p className="text-pink-400 text-xs font-bold uppercase tracking-widest mb-1">{BRAND.tagline}</p>
                        <h3 className="text-2xl font-display font-black mb-1">Welcome, {activeEmployee}</h3>
                        <p className="text-gray-400 text-sm">{BRAND.shopName} · Record sales & check stock</p>
                        <div className="flex flex-wrap gap-3 mt-5">
                          <button
                            onClick={() => setActiveTab('dashboard')}
                            className="px-4 py-2 bg-pink-500 rounded-xl text-sm font-bold hover:bg-pink-400 transition-colors"
                          >
                            Record Sale
                          </button>
                          <button
                            onClick={() => setActiveTab('braids')}
                            className="px-4 py-2 bg-white/10 rounded-xl text-sm font-bold hover:bg-white/20 transition-colors"
                          >
                            Browse Braids
                          </button>
                          <button
                            onClick={() => setActiveTab('inventory')}
                            className="px-4 py-2 bg-white/10 rounded-xl text-sm font-bold hover:bg-white/20 transition-colors"
                          >
                            Stock Check
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Staff Daily Summary */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-pink-100 mb-8">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-xl font-black text-gray-800">Your Daily Sales</h3>
                          <p className="text-sm text-gray-400">Total collected today</p>
                        </div>
                        <div className="bg-pink-50 text-pink-600 px-4 py-2 rounded-xl text-lg font-black">
                          KSh {dailyTotals.total}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-pink-50/30 p-4 rounded-2xl flex items-center gap-4">
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-pink-500 shadow-sm border border-pink-100">
                            <Banknote size={20} />
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase font-bold">Cash</p>
                            <p className="text-lg font-black text-gray-700">KSh {dailyTotals.cash}</p>
                          </div>
                        </div>
                        <div className="bg-pink-50/30 p-4 rounded-2xl flex items-center gap-4">
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-pink-500 shadow-sm border border-pink-100">
                            <CreditCard size={20} />
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase font-bold">Mpesa</p>
                            <p className="text-lg font-black text-gray-700">KSh {dailyTotals.mpesa}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Staff Weekly Summary */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-emerald-100 mb-8">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-black text-gray-800">Your Weekly Sales</h3>
                          <p className="text-sm text-gray-400">Total collected past 7 days</p>
                        </div>
                        <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-lg font-black" title="Includes both Cash and Mpesa">
                          KSh {weeklyTotals.total}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <h3 className="text-xl font-black text-gray-800">Quick Record Sale</h3>
                      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                        {CATEGORIES.map(cat => (
                          <button
                            key={cat}
                            onClick={() => {
                              setSelectedCategory(cat);
                              if (cat !== 'Braids') setBraidFilters(emptyBraidFilters());
                            }}
                            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${selectedCategory === cat
                                ? 'bg-pink-500 text-white shadow-md shadow-pink-200'
                                : 'bg-white text-gray-500 border border-pink-100 hover:border-pink-300'
                              }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    {selectedCategory === 'Braids' && (
                      <BraidFilters
                        filters={braidFilters}
                        onChange={setBraidFilters}
                        resultCount={filteredProducts.length}
                        compact
                      />
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {filteredProducts.map(product => (
                        <motion.div
                          layout
                          key={product.id}
                          whileHover={{ y: -5 }}
                          className="bg-white rounded-3xl border border-pink-50 p-4 hover:shadow-xl hover:shadow-pink-100/50 transition-all group"
                        >
                          <div className="relative aspect-square rounded-2xl overflow-hidden mb-4">
                            <img src={product.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                            <div className="absolute top-2 right-2">
                              <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase ${product.stockQuantity > 5 ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                                {product.stockQuantity} in stock
                              </span>
                            </div>
                          </div>
                          <h4 className="font-bold text-gray-800 text-sm line-clamp-1">{product.name}</h4>
                          <div className="flex items-center gap-2 mb-3">
                            <p className="text-[10px] text-gray-400 font-medium">{product.brand}</p>
                            {getBraidStyle(product) && (
                              <span className="text-[8px] font-bold bg-pink-100 text-pink-600 px-1.5 py-0.5 rounded uppercase">
                                {getBraidStyle(product)}{product.braidLength ? ` · ${product.braidLength}` : ''}{product.colorNumber ? ` (#${product.colorNumber})` : ''}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-lg font-black text-pink-600">KSh {product.sellingPrice}</p>
                            <button
                              onClick={() => {
                                setSelectedProductForSale(product);
                                setAmountPaid(product.sellingPrice);
                                setSaleQuantity(1);
                                setPaymentStatus('Paid');
                                setPaymentMethod(null);
                                setDiscount(0);
                              }}
                              className="p-2 bg-pink-50 text-pink-500 rounded-xl hover:bg-pink-500 hover:text-white transition-all"
                            >
                              <Plus size={18} />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'summary' && role === 'admin' && (
              <motion.div
                key="summary"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-black text-gray-800">Weekly Sales Summary</h3>
                  <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-pink-100 text-sm font-bold text-pink-500">
                    Last 7 Days
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                  {Array.from({ length: 7 }, (_, i) => {
                    const date = new Date();
                    date.setDate(date.getDate() - i);
                    const dateStr = date.toISOString().split('T')[0];
                    const daySales = sales.filter(s => s.createdAt.startsWith(dateStr));
                    const total = daySales.reduce((sum, s) => sum + s.amountPaid, 0);
                    const profit = daySales.reduce((sum, s) => sum + s.profit, 0);

                    return (
                      <div key={dateStr} className="bg-white p-4 rounded-2xl shadow-sm border border-pink-100 flex flex-col items-center text-center">
                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">
                          {date.toLocaleDateString('en-US', { weekday: 'short' })}
                        </p>
                        <p className="text-xs font-bold text-gray-700 mb-2">{date.getDate()}</p>
                        <div className="w-full h-24 bg-pink-50 rounded-lg relative overflow-hidden mb-2">
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${Math.min(100, (total / 1000) * 100)}%` }}
                            className="absolute bottom-0 left-0 right-0 bg-pink-500"
                          />
                        </div>
                        <p className="text-xs font-black text-pink-600">KSh {total}</p>
                        <p className="text-[10px] font-bold text-emerald-500">+KSh {profit}</p>
                      </div>
                    );
                  }).reverse()}
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-sm border border-pink-100">
                  <h4 className="font-bold text-gray-800 mb-6">Detailed Sales History</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-pink-50/50 text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                        <tr>
                          <th className="px-6 py-4">Date & Time</th>
                          <th className="px-6 py-4">Seller/Agent</th>
                          <th className="px-6 py-4">Customer</th>
                          <th className="px-6 py-4">Product</th>
                          <th className="px-6 py-4">Qty</th>
                          <th className="px-6 py-4">Price</th>
                          <th className="px-6 py-4">Discount</th>
                          <th className="px-6 py-4">Method</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4">Profit</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-pink-50">
                        {visibleSales.slice().reverse().map(sale => (
                          <tr key={sale.id} className="hover:bg-pink-50/30 transition-colors">
                            <td className="px-6 py-4">
                              <p className="text-xs font-bold text-gray-700">{formatDate(sale.createdAt)}</p>
                              <p className="text-[10px] text-gray-400">{formatTime(sale.createdAt)}</p>
                            </td>
                            <td className="px-6 py-4 text-xs font-medium text-gray-500">{sale.sellerName}</td>
                            <td className="px-6 py-4">
                              {sale.customerName ? (
                                <>
                                  <div className="flex items-center gap-2">
                                    <p className="text-xs font-bold text-gray-700">{sale.customerName}</p>
                                    {sale.paymentStatus === 'Debt' && (
                                      <span className="text-[8px] font-black bg-red-100 text-red-600 px-1.5 py-0.5 rounded uppercase">Debt Owner</span>
                                    )}
                                  </div>
                                  {sale.customerPhone && <p className="text-[10px] text-gray-400">{sale.customerPhone}</p>}
                                </>
                              ) : (
                                <span className="text-xs text-gray-400">-</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm font-bold text-gray-700">{sale.productName}</p>
                              <p className="text-[10px] text-pink-400 font-bold uppercase">{sale.brand}</p>
                            </td>
                            <td className="px-6 py-4 text-xs font-bold text-gray-600">{sale.quantity}</td>
                            <td className="px-6 py-4 text-sm font-black text-pink-600">KSh {sale.sellingPrice * sale.quantity}</td>
                            <td className="px-6 py-4 text-xs font-bold text-red-500">{sale.discount ? `-KSh ${sale.discount}` : '-'}</td>
                            <td className="px-6 py-4">
                              <span className={`text-[9px] font-bold px-2 py-1 rounded-lg uppercase ${sale.paymentMethod === 'Mpesa' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                {sale.paymentMethod}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {sale.paymentStatus !== 'Paid' ? (
                                <button
                                  onClick={() => handleClearDebt(sale.id)}
                                  className={`text-[9px] font-bold px-2 py-1 rounded-lg uppercase transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-sm hover:shadow-md ${getStatusColor(sale.paymentStatus)} bg-white border border-current hover:bg-emerald-50`}
                                  title="Click to mark as Paid"
                                >
                                  {sale.paymentStatus}
                                </button>
                              ) : (
                                <span className={`text-[9px] font-bold px-2 py-1 rounded-lg uppercase ${getStatusColor(sale.paymentStatus)}`}>
                                  {sale.paymentStatus}
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm font-bold text-emerald-500">+KSh {sale.profit}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'reports' && role === 'admin' && (
              <motion.div
                key="reports"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-black text-gray-800">Profit & Financials</h3>
                    <p className="text-sm text-gray-500">Track your business profitability over time</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-pink-100">
                    <p className="text-xs font-bold text-gray-400 uppercase mb-1">Today's Profit</p>
                    <p className="text-3xl font-black text-emerald-600">KSh {dailyTotals.profit}</p>
                    <div className="mt-4 flex items-center gap-2 text-xs text-emerald-500 font-bold">
                      <TrendingUp size={14} />
                      <span>Today</span>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-pink-100">
                    <p className="text-xs font-bold text-gray-400 uppercase mb-1">Weekly Profit</p>
                    <p className="text-3xl font-black text-pink-600">KSh {weeklyTotals.profit}</p>
                    <div className="mt-4 flex items-center gap-2 text-xs text-pink-400 font-bold">
                      <TrendingUp size={14} />
                      <span>Past 7 Days</span>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-pink-100">
                    <p className="text-xs font-bold text-gray-400 uppercase mb-1">Monthly Profit</p>
                    <p className="text-3xl font-black text-blue-600">KSh {monthlyTotals.profit}</p>
                    <div className="mt-4 flex items-center gap-2 text-xs text-blue-400 font-bold">
                      <TrendingUp size={14} />
                      <span>Past 30 Days</span>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-pink-100">
                    <p className="text-xs font-bold text-gray-400 uppercase mb-1">Yearly Profit</p>
                    <p className="text-3xl font-black text-purple-600">KSh {yearlyTotals.profit}</p>
                    <div className="mt-4 flex items-center gap-2 text-xs text-purple-400 font-bold">
                      <TrendingUp size={14} />
                      <span>Past 365 Days</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(() => {
                    const highestProfitProduct = [...products].sort((a, b) => (b.sellingPrice - b.lastPrice) - (a.sellingPrice - a.lastPrice))[0];
                    const bestSellingProduct = [...products].map(p => ({
                      ...p,
                      soldQty: visibleSales.filter(s => s.productId === p.id).reduce((sum, s) => sum + s.quantity, 0)
                    })).sort((a, b) => b.soldQty - a.soldQty)[0];

                    return (
                      <>
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-pink-100">
                          <p className="text-xs font-bold text-gray-400 uppercase mb-1">Highest Profit Item</p>
                          {highestProfitProduct ? (
                            <>
                              <p className="text-xl font-black text-emerald-600 truncate">{highestProfitProduct.name}</p>
                              <div className="mt-4 flex items-center gap-2 text-xs text-emerald-500 font-bold">
                                <TrendingUp size={14} />
                                <span>KSh {highestProfitProduct.sellingPrice - highestProfitProduct.lastPrice} profit/unit</span>
                              </div>
                            </>
                          ) : <p className="text-sm">No data</p>}
                        </div>
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-pink-100">
                          <p className="text-xs font-bold text-gray-400 uppercase mb-1">Best Selling Product</p>
                          {bestSellingProduct ? (
                            <>
                              <p className="text-xl font-black text-blue-600 truncate">{bestSellingProduct.name}</p>
                              <div className="mt-4 flex items-center gap-2 text-xs text-blue-500 font-bold">
                                <TrendingUp size={14} />
                                <span>{bestSellingProduct.soldQty} units sold</span>
                              </div>
                            </>
                          ) : <p className="text-sm">No data</p>}
                        </div>
                      </>
                    )
                  })()}
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-pink-100 overflow-hidden">
                  <div className="p-6 border-b border-pink-50">
                    <h4 className="font-bold text-gray-800">Profit History Log</h4>
                    <p className="text-xs text-gray-500 mt-1">Detailed history of profit earned per sale</p>
                  </div>
                  <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                    <table className="w-full text-left relative">
                      <thead className="bg-pink-50/90 backdrop-blur text-[10px] font-bold uppercase text-gray-400 tracking-wider sticky top-0 z-10">
                        <tr>
                          <th className="px-6 py-4">Date & Time</th>
                          <th className="px-6 py-4">Product</th>
                          <th className="px-6 py-4">Agent</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 text-right">Revenue</th>
                          <th className="px-6 py-4 text-right">Profit Earned</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-pink-50">
                        {visibleSales.filter(s => s.profit > 0 || s.paymentStatus === 'Paid').slice(0, 50).map(sale => (
                          <tr key={'profit-' + sale.id} className="hover:bg-pink-50/30 transition-colors">
                            <td className="px-6 py-4">
                              <p className="text-sm font-bold text-gray-700">{new Date(sale.createdAt).toLocaleDateString()}</p>
                              <p className="text-[10px] text-gray-400">{new Date(sale.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm font-bold text-gray-800">{sale.productName}</p>
                              <p className="text-[10px] text-gray-500">{sale.quantity} units</p>
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-600">{sale.staffName || 'Admin'}</td>
                            <td className="px-6 py-4">
                              <span className={`text-[10px] font-bold px-2 py-1 rounded-lg uppercase ${getStatusColor(sale.paymentStatus)} bg-white border border-current shadow-sm`}>
                                {sale.paymentStatus}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm font-bold text-gray-700 text-right">KSh {sale.amountPaid}</td>
                            <td className="px-6 py-4 text-sm font-black text-emerald-600 text-right">+KSh {sale.profit}</td>
                          </tr>
                        ))}
                        {visibleSales.length === 0 && (
                          <tr>
                            <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-400 font-medium">
                              No profit history available yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {(Object.entries(dailyTotals.byEmployee).length > 0 || Object.entries(weeklyTotals.byEmployee).length > 0) && (
                  <div className="bg-white rounded-3xl shadow-sm border border-emerald-100 overflow-hidden">
                    <div className="p-6 border-b border-emerald-50">
                      <h4 className="font-bold text-gray-800">Sales by Employee (Daily & Weekly)</h4>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-emerald-50/50 text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                          <tr>
                            <th className="px-6 py-4">Employee</th>
                            <th className="px-6 py-4">Today's Sales</th>
                            <th className="px-6 py-4">Last 7 Days</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-emerald-50">
                          {Array.from(new Set([...Object.keys(dailyTotals.byEmployee), ...Object.keys(weeklyTotals.byEmployee)])).map((emp) => {
                            const daily = dailyTotals.byEmployee[emp] || { total: 0, count: 0 };
                            const weekly = weeklyTotals.byEmployee[emp] || { total: 0, count: 0 };
                            return (
                              <tr key={emp} className="hover:bg-emerald-50/30 transition-colors">
                                <td className="px-6 py-4 text-sm font-bold text-gray-800">{emp}</td>
                                <td className="px-6 py-4 text-sm font-bold text-emerald-600">
                                  KSh {daily.total} <span className="text-[10px] font-medium text-gray-400 ml-1">({daily.count} sales)</span>
                                </td>
                                <td className="px-6 py-4 text-sm font-bold text-pink-600">
                                  KSh {weekly.total} <span className="text-[10px] font-medium text-gray-400 ml-1">({weekly.count} sales)</span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="bg-white rounded-3xl shadow-sm border border-pink-100 overflow-hidden">
                  <div className="p-6 border-b border-pink-50">
                    <h4 className="font-bold text-gray-800">Profit per Product</h4>
                  </div>
                  <table className="w-full text-left">
                    <thead className="bg-pink-50/50 text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                      <tr>
                        <th className="px-6 py-4">Product</th>
                        <th className="px-6 py-4">Buying Price</th>
                        <th className="px-6 py-4">Selling Price</th>
                        <th className="px-6 py-4">Profit/Unit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-pink-50">
                      {[...products].sort((a, b) => {
                        const dateA = a.createdAt.split('T')[0];
                        const dateB = b.createdAt.split('T')[0];
                        if (dateA !== dateB) return dateB.localeCompare(dateA);
                        return a.name.localeCompare(b.name);
                      }).map(product => {
                        const productSales = visibleSales.filter(s => s.productId === product.id);
                        return (
                          <tr key={product.id} className="hover:bg-pink-50/30 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <img src={product.imageUrl} className="w-8 h-8 rounded-lg object-cover" referrerPolicy="no-referrer" />
                                <p className="text-sm font-bold text-gray-700">{product.name}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">KSh {product.lastPrice}</td>
                            <td className="px-6 py-4 text-sm font-bold text-pink-600">KSh {product.sellingPrice}</td>
                            <td className="px-6 py-4 text-sm font-bold text-emerald-600">KSh {product.sellingPrice - product.lastPrice}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === 'sales' && (
              <motion.div
                key="sales"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white rounded-3xl shadow-sm border border-pink-100 overflow-hidden"
              >
                <div className="p-6 border-b border-pink-50 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <h3 className="font-bold text-gray-800">Sales History</h3>
                    <div className="relative group">
                      <button className="flex items-center gap-2 bg-pink-50 text-pink-500 px-4 py-2 rounded-xl text-sm font-bold hover:bg-pink-100 transition-all active:scale-95">
                        <CalendarIcon size={18} />
                        <span>{selectedDate ? formatDate(selectedDate) : 'Select Day'}</span>
                      </button>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                    {selectedDate && (
                      <button
                        onClick={() => setSelectedDate('')}
                        className="text-xs text-gray-400 hover:text-pink-500 font-bold underline"
                      >
                        Clear Filter
                      </button>
                    )}
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-pink-50/50 text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                      <tr>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Customer</th>
                        <th className="px-6 py-4">Product Sold</th>
                        <th className="px-6 py-4">QTY</th>
                        <th className="px-6 py-4">Price</th>
                        <th className="px-6 py-4">Discount</th>
                        <th className="px-6 py-4">Method</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Seller/Agent</th>
                        <th className="px-6 py-4">Cleared At</th>
                        {role === 'admin' && <th className="px-6 py-4">Profit</th>}
                        <th className="px-6 py-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-pink-50">
                      {visibleSales.filter(s => !selectedDate || new Date(s.createdAt).toDateString() === new Date(selectedDate).toDateString()).map(sale => (
                        <tr key={sale.id} className="hover:bg-pink-50/30 transition-colors">
                          <td className="px-6 py-4 text-xs text-gray-500">
                            {formatDate(sale.createdAt)}
                            <p className="text-[10px] text-gray-300">{new Date(sale.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          </td>
                          <td className="px-6 py-4">
                            {sale.customerName ? (
                              <>
                                <div className="flex items-center gap-2">
                                  <p className="text-xs font-bold text-gray-700">{sale.customerName}</p>
                                  {sale.paymentStatus === 'Debt' && (
                                    <span className="text-[8px] font-black bg-red-100 text-red-600 px-1.5 py-0.5 rounded uppercase">Debt Owner</span>
                                  )}
                                </div>
                                {sale.customerPhone && <p className="text-[10px] text-gray-400">{sale.customerPhone}</p>}
                              </>
                            ) : (
                              <span className="text-xs text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-bold text-gray-700">{sale.productName}</p>
                            <p className="text-[10px] text-pink-400 font-bold uppercase">{sale.brand}</p>
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold">{sale.quantity}</td>
                          <td className="px-6 py-4 text-sm font-bold text-pink-600">KSh {sale.sellingPrice * sale.quantity}</td>
                          <td className="px-6 py-4 text-xs font-bold text-red-500">{sale.discount ? `-KSh ${sale.discount}` : '-'}</td>
                          <td className="px-6 py-4">
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-lg uppercase ${sale.paymentMethod === 'Mpesa' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                              {sale.paymentMethod}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {sale.paymentStatus !== 'Paid' ? (
                              <button
                                onClick={() => handleClearDebt(sale.id)}
                                className={`text-[10px] font-bold px-2 py-1 rounded-lg uppercase transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-sm hover:shadow-md ${getStatusColor(sale.paymentStatus)} bg-white border border-current hover:bg-emerald-50`}
                                title="Click to mark as Paid"
                              >
                                {sale.paymentStatus}
                              </button>
                            ) : (
                              <span className={`text-[10px] font-bold px-2 py-1 rounded-lg uppercase ${getStatusColor(sale.paymentStatus)}`}>
                                {sale.paymentStatus}
                              </span>
                            )}
                            {sale.paymentStatus === 'Deposit' && (
                              <p className="text-[10px] text-gray-400 mt-1">Paid: KSh {sale.amountPaid}</p>
                            )}
                          </td>
                          <td className="px-6 py-4 text-xs font-medium text-gray-500">{sale.sellerName}</td>
                          <td className="px-6 py-4 text-xs text-gray-400">
                            {sale.clearedAt ? (
                              <>
                                <p className="font-bold text-gray-600">{formatDate(sale.clearedAt)}</p>
                                <p className="text-[10px]">{formatTime(sale.clearedAt)}</p>
                              </>
                            ) : '-'}
                          </td>
                          {role === 'admin' && (
                            <td className="px-6 py-4 text-sm font-bold text-emerald-500">+KSh {sale.profit}</td>
                          )}
                          <td className="px-6 py-4">
                            <button
                              onClick={() => setReceiptSale(sale)}
                              className="text-xs font-bold text-pink-500 hover:text-pink-600 underline"
                            >
                              Receipt
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Sales Totals for the day */}
                <div className={`p-6 bg-pink-50/30 border-t border-pink-100 grid grid-cols-1 ${role === 'admin' ? 'md:grid-cols-5' : 'md:grid-cols-3'} gap-4`}>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 font-bold uppercase">Cash Total</span>
                    <span className="text-lg font-black text-gray-700">KSh {dailyTotals.cash}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 font-bold uppercase">Mpesa Total</span>
                    <span className="text-lg font-black text-gray-700">KSh {dailyTotals.mpesa}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-pink-400 font-bold uppercase">Grand Total (Paid)</span>
                    <span className="text-xl font-black text-pink-600">KSh {dailyTotals.total}</span>
                  </div>
                  {role === 'admin' && (
                    <>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-emerald-500 font-bold uppercase">Total Profit</span>
                        <span className="text-lg font-black text-emerald-600">KSh {dailyTotals.profit}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-indigo-400 font-bold uppercase">Total Sales Value</span>
                        <span className="text-lg font-black text-indigo-600">KSh {dailyTotals.totalSalesValue}</span>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'braids' && (
              <BraidsPanel
                products={products}
                role={role}
                onRecordSale={(product) => {
                  setSelectedProductForSale(product);
                  setAmountPaid(product.sellingPrice);
                  setSaleQuantity(1);
                  setPaymentStatus('Paid');
                  setPaymentMethod(null);
                  setDiscount(0);
                }}
                onAddBraid={role === 'admin' ? () => setActiveTab('inventory') : undefined}
              />
            )}

            {activeTab === 'inventory' && (
              <InventoryPanel
                products={products}
                setProducts={setProducts}
                role={role}
                activeEmployee={activeEmployee}
                onRecordSale={(product) => {
                  setSelectedProductForSale(product);
                  setAmountPaid(product.sellingPrice);
                  setSaleQuantity(1);
                  setPaymentStatus('Paid');
                  setPaymentMethod(null);
                  setDiscount(0);
                }}
                showNotification={showNotification}
              />
            )}

            {activeTab === 'required-products' && (
              <motion.div
                key="required-products"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-bold text-gray-800">Required Products</h3>
                  <button
                    onClick={() => setIsRequestingProduct(true)}
                    className="flex items-center gap-2 bg-pink-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-pink-600 shadow-md shadow-pink-200 transition-all active:scale-95"
                  >
                    <Plus size={18} />
                    <span>Request Product</span>
                  </button>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-pink-100 overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-pink-50/50 text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                      <tr>
                        <th className="px-6 py-4">Product Name</th>
                        <th className="px-6 py-4">Requested By</th>
                        <th className="px-6 py-4">Date Requested</th>
                        <th className="px-6 py-4">Status</th>
                        {role === 'admin' && <th className="px-6 py-4">Action</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-pink-50">
                      {requestedProducts.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                            No requested products currently.
                          </td>
                        </tr>
                      )}
                      {requestedProducts.map(req => (
                        <tr key={req.id} className="hover:bg-pink-50/30 transition-colors">
                          <td className="px-6 py-4 text-sm font-bold text-gray-800">{req.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{req.requestedBy}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{new Date(req.dateRequested).toLocaleDateString()}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${req.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                                req.status === 'Fulfilled' ? 'bg-green-100 text-green-700' :
                                  'bg-red-100 text-red-700'
                              }`}>
                              {req.status}
                            </span>
                          </td>
                          {role === 'admin' && (
                            <td className="px-6 py-4">
                              {req.status === 'Pending' && (
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => setRequestedProducts(requestedProducts.map(r => r.id === req.id ? { ...r, status: 'Fulfilled' } : r))}
                                    className="p-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                                    title="Mark as Fulfilled"
                                  >
                                    <CheckCircle2 size={16} />
                                  </button>
                                  <button
                                    onClick={() => setRequestedProducts(requestedProducts.map(r => r.id === req.id ? { ...r, status: 'Cancelled' } : r))}
                                    className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                    title="Cancel Request"
                                  >
                                    <X size={16} />
                                  </button>
                                </div>
                              )}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === 'sellers' && role === 'admin' && (
              <motion.div
                key="sellers"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-pink-100">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <h3 className="font-bold text-gray-800">Wholesalers & Suppliers</h3>
                      <button
                        onClick={() => {
                          setEditingSeller(null);
                          setSellerFormData({ name: '', productName: '', amount: 0, contact: '', whatsappNumber: '' });
                          setIsAddingSeller(true);
                        }}
                        className="flex items-center gap-2 bg-pink-500 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-pink-600 transition-all active:scale-95"
                      >
                        <Plus size={14} />
                        Add Wholesaler
                      </button>
                    </div>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        placeholder="Search by product name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-pink-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-pink-300 transition-all w-64"
                      />
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-pink-50/50 text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                        <tr>
                          <th className="px-6 py-4">Wholesaler</th>
                          <th className="px-6 py-4">Product</th>
                          <th className="px-6 py-4">Price</th>
                          <th className="px-6 py-4">Date Added</th>
                          <th className="px-6 py-4">Contact</th>
                          <th className="px-6 py-4">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-pink-50">
                        {CATEGORIES.filter(c => c !== 'All').map(category => {
                          const categorySellers = sellers.filter(s => {
                            const product = products.find(p => p.name === s.productName);
                            return product?.category === category || (!product && category === 'Other');
                          }).filter(s => s.productName.toLowerCase().includes(searchQuery.toLowerCase()))
                            .sort((a, b) => a.amount - b.amount);

                          if (categorySellers.length === 0) return null;

                          return (
                            <React.Fragment key={category}>
                              <tr className="bg-pink-50/20">
                                <td colSpan={6} className="px-6 py-2 text-[10px] font-black text-pink-400 uppercase tracking-widest">{category}</td>
                              </tr>
                              {categorySellers.map((seller, index) => (
                                <tr key={seller.id} className={`hover:bg-pink-50/30 transition-colors ${index === 0 && searchQuery ? 'bg-emerald-50/50' : ''}`}>
                                  <td className="px-6 py-4">
                                    <p className="text-sm font-bold text-gray-700">{seller.name}</p>
                                    {index === 0 && searchQuery && <span className="text-[10px] text-emerald-500 font-bold uppercase">Best Price</span>}
                                  </td>
                                  <td className="px-6 py-4 text-sm text-gray-600">{seller.productName}</td>
                                  <td className="px-6 py-4 text-sm font-black text-pink-600">KSh {seller.amount}</td>
                                  <td className="px-6 py-4 text-xs text-gray-400">{seller.dateAdded}</td>
                                  <td className="px-6 py-4 text-sm text-gray-500">{seller.contact}</td>
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                      {seller.whatsappNumber && (
                                        <a
                                          href={`https://wa.me/${seller.whatsappNumber}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all"
                                          title="WhatsApp"
                                        >
                                          <MessageCircle size={16} />
                                        </a>
                                      )}
                                      <button
                                        onClick={() => {
                                          setEditingSeller(seller);
                                          setSellerFormData({ ...seller });
                                          setIsAddingSeller(true);
                                        }}
                                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                                        title="Edit"
                                      >
                                        <Key size={16} />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteSeller(seller.id)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                        title="Delete"
                                      >
                                        <X size={16} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </React.Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-sm border border-pink-100">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-gray-800">Sales Agents</h3>
                    <button
                      onClick={() => setIsAddingAgent(true)}
                      className="flex items-center gap-2 bg-pink-500 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-pink-600 transition-all active:scale-95"
                    >
                      <Plus size={14} />
                      Add Agent
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {agents.map(agent => (
                      <div key={agent} className="bg-pink-50/50 p-4 rounded-2xl flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-pink-500 font-bold shadow-sm">
                            {agent.charAt(0)}
                          </div>
                          <span className="font-bold text-gray-700">{agent}</span>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEditAgent(agent)}
                            className="p-2 text-blue-500 hover:bg-white rounded-lg transition-all"
                          >
                            <Key size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteAgent(agent)}
                            className="p-2 text-red-500 hover:bg-white rounded-lg transition-all"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Record Sale Modal */}
      <AnimatePresence>
        {selectedProductForSale && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProductForSale(null)}
              className="absolute inset-0 bg-pink-900/20 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden border border-pink-100 max-h-[95vh] flex flex-col"
            >
              <div className="p-5 overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-black text-gray-800">Record Sale</h3>
                  <button onClick={() => setSelectedProductForSale(null)} className="p-2 hover:bg-pink-50 rounded-full text-gray-400">
                    <X size={20} />
                  </button>
                </div>

                <div className="flex items-center gap-3 p-3 bg-pink-50 rounded-2xl mb-4">
                  <img src={selectedProductForSale.imageUrl} className="w-12 h-12 rounded-xl object-cover" referrerPolicy="no-referrer" />
                  <div>
                    <p className="text-[10px] text-pink-400 font-bold uppercase">{selectedProductForSale.brand}</p>
                    <h4 className="font-bold text-gray-800 text-sm">{selectedProductForSale.name}</h4>
                    <p className="text-base font-black text-pink-600">KSh {selectedProductForSale.sellingPrice}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 block">Seller/Agent</label>
                    <select
                      value={role === 'admin' ? selectedSeller : (activeEmployee || selectedSeller)}
                      onChange={(e) => setSelectedSeller(e.target.value)}
                      disabled={role !== 'admin'}
                      className="w-full px-3 py-2 bg-pink-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-pink-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {agents.map(name => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 block">Quantity</label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          const newQty = Math.max(1, saleQuantity - 1);
                          setSaleQuantity(newQty);
                          if (paymentStatus === 'Paid') setAmountPaid((selectedProductForSale.sellingPrice * newQty) - discount);
                        }}
                        className="w-10 h-10 bg-pink-50 rounded-xl flex items-center justify-center text-pink-500 font-bold text-lg"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={saleQuantity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          const newQty = isNaN(val) ? 1 : Math.max(1, Math.min(selectedProductForSale.stockQuantity, val));
                          setSaleQuantity(newQty);
                          if (paymentStatus === 'Paid') setAmountPaid((selectedProductForSale.sellingPrice * newQty) - discount);
                        }}
                        className="w-16 h-10 bg-pink-50 border-none rounded-xl text-xl font-black text-gray-800 text-center focus:ring-2 focus:ring-pink-300 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button
                        onClick={() => {
                          const newQty = Math.min(selectedProductForSale.stockQuantity, saleQuantity + 1);
                          setSaleQuantity(newQty);
                          if (paymentStatus === 'Paid') setAmountPaid((selectedProductForSale.sellingPrice * newQty) - discount);
                        }}
                        className="w-10 h-10 bg-pink-50 rounded-xl flex items-center justify-center text-pink-500 font-bold text-lg"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 block">
                        {paymentStatus === 'Debt' ? 'Debt Owner Name (Required)' : 'Customer Name (Optional)'}
                      </label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="e.g. Jane Doe"
                        className={`w-full px-3 py-2 bg-pink-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-pink-300 transition-all ${paymentStatus === 'Debt' && !customerName.trim() ? 'ring-2 ring-red-300' : ''}`}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 block">Customer Phone (Optional)</label>
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="e.g. 0712345678"
                        className="w-full px-3 py-2 bg-pink-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-pink-300 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 block">Discount Amount (KSh)</label>
                    <input
                      type="number"
                      value={discount}
                      onChange={(e) => {
                        const newDiscount = Number(e.target.value);
                        setDiscount(newDiscount);
                        if (paymentStatus === 'Paid') {
                          setAmountPaid((selectedProductForSale.sellingPrice * saleQuantity) - newDiscount);
                        }
                      }}
                      min="0"
                      className="w-full px-3 py-2 bg-pink-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-pink-300 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Payment Status</label>
                      <div className="flex flex-col gap-1.5">
                        {(['Paid', 'Deposit', 'Debt'] as PaymentStatus[]).map(status => (
                          <button
                            key={status}
                            onClick={() => {
                              setPaymentStatus(status);
                              if (status === 'Paid') setAmountPaid((selectedProductForSale.sellingPrice * saleQuantity) - discount);
                              if (status === 'Debt') setAmountPaid(0);
                            }}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${paymentStatus === status ? 'bg-pink-500 text-white' : 'bg-pink-50 text-pink-400'}`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Amount Paid</label>
                      <input
                        type="number"
                        value={amountPaid}
                        onChange={(e) => setAmountPaid(Number(e.target.value))}
                        disabled={paymentStatus === 'Paid' || paymentStatus === 'Debt'}
                        className={`w-full px-3 py-2 bg-pink-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-pink-300 transition-all ${paymentStatus === 'Paid' || paymentStatus === 'Debt' ? 'opacity-50 cursor-not-allowed' : ''}`}
                      />
                      {paymentStatus === 'Deposit' && (
                        <p className="text-[9px] text-pink-400 font-bold mt-1 uppercase animate-pulse">Enter deposit</p>
                      )}
                      <p className="text-[10px] text-gray-400 mt-1">
                        Due: KSh {(selectedProductForSale.sellingPrice * saleQuantity) - discount}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Payment Method</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setPaymentMethod('Cash')}
                        className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${paymentMethod === 'Cash' ? 'bg-pink-500 text-white shadow-lg shadow-pink-200' : 'bg-pink-50 text-pink-400'}`}
                      >
                        <Banknote size={18} />
                        Cash
                      </button>
                      <button
                        onClick={() => setPaymentMethod('Mpesa')}
                        className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${paymentMethod === 'Mpesa' ? 'bg-pink-500 text-white shadow-lg shadow-pink-200' : 'bg-pink-50 text-pink-400'}`}
                      >
                        <CreditCard size={18} />
                        Mpesa
                      </button>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-pink-50 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-bold">Balance</p>
                      <p className={`text-lg font-black ${((selectedProductForSale.sellingPrice * saleQuantity) - discount) - amountPaid > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                        KSh {Math.max(0, ((selectedProductForSale.sellingPrice * saleQuantity) - discount) - amountPaid)}
                      </p>
                    </div>
                    <button
                      onClick={handleRecordSale}
                      disabled={!paymentMethod}
                      className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 text-sm ${paymentMethod
                          ? 'bg-pink-500 text-white shadow-xl shadow-pink-100 active:scale-95'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                      {paymentStatus === 'Debt' ? (
                        <>
                          <AlertTriangle size={18} />
                          Record Debt
                        </>
                      ) : (
                        <>
                          <DollarSign size={18} />
                          {paymentMethod ? `Pay KSh ${amountPaid}` : 'Select Method'}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Request Product Modal */}
      <AnimatePresence>
        {isRequestingProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRequestingProduct(false)}
              className="absolute inset-0 bg-pink-900/20 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden border border-pink-100 max-h-[95vh] flex flex-col"
            >
              <div className="p-6 overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-black text-gray-800">Request Product</h3>
                  <button onClick={() => setIsRequestingProduct(false)} className="p-2 hover:bg-pink-50 rounded-full text-gray-400">
                    <X size={20} />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Product Name / Description</label>
                    <input
                      type="text"
                      value={requestedProductName}
                      onChange={(e) => setRequestedProductName(e.target.value)}
                      placeholder="What product do you need?"
                      className="w-full px-4 py-3 bg-pink-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-pink-300 transition-all"
                    />
                  </div>
                  <button
                    onClick={() => {
                      if (!requestedProductName.trim()) return;
                      const newRequest: RequestedProduct = {
                        id: Math.random().toString(36).substr(2, 9),
                        name: requestedProductName.trim(),
                        requestedBy: activeEmployee || (role === 'admin' ? 'Admin' : 'Staff'),
                        dateRequested: new Date().toISOString(),
                        status: 'Pending'
                      };
                      setRequestedProducts([...requestedProducts, newRequest]);
                      setRequestedProductName('');
                      setIsRequestingProduct(false);
                      showNotification('Product requested successfully', 'success');
                    }}
                    className="w-full bg-pink-500 text-white py-3 rounded-xl font-bold shadow-xl shadow-pink-100 active:scale-95 transition-all mt-4"
                  >
                    Submit Request
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add/Edit Seller Modal */}
      <AnimatePresence>
        {isAddingSeller && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddingSeller(false)}
              className="absolute inset-0 bg-pink-900/20 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden border border-pink-100"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-black text-gray-800">{editingSeller ? 'Edit Wholesaler' : 'Add Wholesaler'}</h3>
                  <button onClick={() => setIsAddingSeller(false)} className="p-2 hover:bg-pink-50 rounded-full text-gray-400">
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Wholesaler Name</label>
                    <input
                      type="text"
                      value={sellerFormData.name}
                      onChange={(e) => setSellerFormData({ ...sellerFormData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-pink-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-pink-300 transition-all"
                      placeholder="e.g., Global Supplies Ltd"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Product Name</label>
                    <select
                      value={sellerFormData.productName}
                      onChange={(e) => setSellerFormData({ ...sellerFormData, productName: e.target.value })}
                      className="w-full px-4 py-3 bg-pink-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-pink-300 transition-all"
                    >
                      <option value="">Select Product</option>
                      {[...products].sort((a, b) => a.name.localeCompare(b.name)).map(p => (
                        <option key={p.id} value={p.name}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Wholesale Price (KSh)</label>
                    <input
                      type="number"
                      value={sellerFormData.amount}
                      onChange={(e) => setSellerFormData({ ...sellerFormData, amount: Number(e.target.value) })}
                      className="w-full px-4 py-3 bg-pink-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-pink-300 transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Contact Info</label>
                      <input
                        type="text"
                        value={sellerFormData.contact}
                        onChange={(e) => setSellerFormData({ ...sellerFormData, contact: e.target.value })}
                        className="w-full px-4 py-3 bg-pink-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-pink-300 transition-all"
                        placeholder="Email or Phone"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">WhatsApp Number</label>
                      <input
                        type="text"
                        value={sellerFormData.whatsappNumber}
                        onChange={(e) => setSellerFormData({ ...sellerFormData, whatsappNumber: e.target.value })}
                        className="w-full px-4 py-3 bg-pink-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-pink-300 transition-all"
                        placeholder="e.g., 254..."
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleSaveSeller}
                    className="w-full bg-pink-500 text-white py-4 rounded-2xl font-bold shadow-xl shadow-pink-100 active:scale-95 transition-all mt-4"
                  >
                    {editingSeller ? 'Update Wholesaler' : 'Save Wholesaler'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Agent Modal */}
      <AnimatePresence>
        {isAddingAgent && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddingAgent(false)}
              className="absolute inset-0 bg-pink-900/20 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-sm rounded-[32px] shadow-2xl overflow-hidden border border-pink-100"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-black text-gray-800">{editingAgent ? 'Edit Agent' : 'Add New Agent'}</h3>
                  <button onClick={() => {
                    setIsAddingAgent(false);
                    setEditingAgent(null);
                    setNewAgentName('');
                  }} className="p-2 hover:bg-pink-50 rounded-full text-gray-400">
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Agent Name</label>
                    <input
                      type="text"
                      value={newAgentName}
                      onChange={(e) => setNewAgentName(e.target.value)}
                      className="w-full px-4 py-3 bg-pink-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-pink-300 transition-all"
                      placeholder="e.g., John Doe"
                      autoFocus
                    />
                  </div>

                  <button
                    onClick={handleAddAgent}
                    className="w-full bg-pink-500 text-white py-4 rounded-2xl font-bold shadow-xl shadow-pink-100 active:scale-95 transition-all mt-4"
                  >
                    {editingAgent ? 'Update Agent' : 'Add Agent'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Receipt Modal */}
      <AnimatePresence>
        {receiptSale && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setReceiptSale(null)}
              className="absolute inset-0 bg-pink-900/20 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-sm rounded-[32px] shadow-2xl overflow-hidden border border-pink-100"
            >
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-2xl font-black text-gray-800 mb-1">Sale Recorded!</h3>
                <p className="text-gray-400 text-sm mb-6">Receipt #{receiptSale.id.toUpperCase()}</p>

                <div className="bg-pink-50 rounded-2xl p-4 text-left space-y-3 mb-6">
                  <div className="flex justify-between items-center border-b border-pink-100 pb-2">
                    <span className="text-gray-500 text-xs font-bold">Item</span>
                    <span className="text-gray-800 text-sm font-black">{receiptSale.productName} (x{receiptSale.quantity})</span>
                  </div>
                  {receiptSale.customerName && (
                    <div className="flex justify-between items-center border-b border-pink-100 pb-2">
                      <span className="text-gray-500 text-xs font-bold">Customer</span>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-800 text-sm font-black">{receiptSale.customerName}</span>
                        {receiptSale.paymentStatus === 'Debt' && (
                          <span className="text-[8px] font-black bg-red-100 text-red-600 px-1.5 py-0.5 rounded uppercase">Debt Owner</span>
                        )}
                      </div>
                    </div>
                  )}
                  {receiptSale.discount && receiptSale.discount > 0 && (
                    <div className="flex justify-between items-center border-b border-pink-100 pb-2">
                      <span className="text-gray-500 text-xs font-bold">Discount</span>
                      <span className="text-red-500 text-sm font-black">-KSh {receiptSale.discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center border-b border-pink-100 pb-2">
                    <span className="text-gray-500 text-xs font-bold">Total</span>
                    <span className="text-gray-800 text-sm font-black">KSh {(receiptSale.sellingPrice * receiptSale.quantity) - (receiptSale.discount || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-pink-100 pb-2">
                    <span className="text-gray-500 text-xs font-bold">Paid ({receiptSale.paymentMethod})</span>
                    <span className="text-emerald-500 text-sm font-black">KSh {receiptSale.amountPaid}</span>
                  </div>
                  {receiptSale.debtAmount > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-xs font-bold">Balance Due</span>
                      <span className="text-red-500 text-sm font-black">KSh {receiptSale.debtAmount}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      // In a real app, this would trigger a print dialog
                      showNotification('Printing receipt...');
                      setTimeout(() => setReceiptSale(null), 1000);
                    }}
                    className="flex-1 bg-pink-100 text-pink-600 py-3 rounded-xl font-bold hover:bg-pink-200 transition-all"
                  >
                    Print
                  </button>
                  <button
                    onClick={() => setReceiptSale(null)}
                    className="flex-1 bg-pink-500 text-white py-3 rounded-xl font-bold hover:bg-pink-600 shadow-lg shadow-pink-200 transition-all"
                  >
                    Done
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-bold text-sm ${notification.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
              }`}
          >
            {notification.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Dialog */}
      <AnimatePresence>
        {confirmDialog && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setConfirmDialog(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative bg-white w-full max-w-xs rounded-[32px] p-6 shadow-2xl border border-pink-100 text-center"
            >
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-lg font-black text-gray-800 mb-2">Are you sure?</h3>
              <p className="text-sm text-gray-500 mb-6">{confirmDialog.message}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDialog(null)}
                  className="flex-1 py-3 rounded-xl font-bold text-gray-400 hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDialog.onConfirm}
                  className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold shadow-lg shadow-red-100 active:scale-95 transition-all"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
