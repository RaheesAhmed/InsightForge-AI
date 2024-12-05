"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  Settings2,
  MoreVertical,
  Trash2,
  Edit2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

interface Product {
  id: string;
  name: string;
  description: string;
  type: "model" | "feature";
  status: "active" | "inactive" | "beta";
  usageCount: number;
  lastUpdated: string;
}

const mockProducts: Product[] = [
  {
    id: "1",
    name: "GPT-4 Integration",
    description: "Advanced language model for complex tasks",
    type: "model",
    status: "active",
    usageCount: 15234,
    lastUpdated: "2024-03-15",
  },
  {
    id: "2",
    name: "Claude Integration",
    description: "Anthropic's AI model for analysis",
    type: "model",
    status: "active",
    usageCount: 8456,
    lastUpdated: "2024-03-14",
  },
  {
    id: "3",
    name: "Document Analysis",
    description: "AI-powered document processing",
    type: "feature",
    status: "beta",
    usageCount: 3789,
    lastUpdated: "2024-03-13",
  },
];

export default function Products() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: Product["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "inactive":
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
      case "beta":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      default:
        return "";
    }
  };

  return (
    <div className="p-6 space-y-6 bg-[#0A0F1E] min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Products & Features
          </h1>
          <p className="text-gray-400 mt-1">
            Manage AI models and platform features
          </p>
        </div>
        <Button className="relative inline-flex items-center justify-center px-4 py-2 font-medium text-white transition-all duration-200 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg hover:from-blue-600 hover:to-indigo-600">
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white"
          />
        </div>
        <Button
          variant="outline"
          className="border-white/10 text-white hover:bg-white/5"
        >
          <Settings2 className="w-4 h-4 mr-2" />
          Settings
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="bg-white/5 border-white/10">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <Badge className={getStatusColor(product.status)}>
                  {product.status.charAt(0).toUpperCase() +
                    product.status.slice(1)}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-400 hover:text-white"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="bg-[#1A1F2E] border-white/10"
                  >
                    <DropdownMenuLabel className="text-gray-400">
                      Actions
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem className="text-white hover:bg-white/5">
                      <Edit2 className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-400 hover:bg-red-500/10">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <CardTitle className="text-white mt-2">{product.name}</CardTitle>
              <CardDescription className="text-gray-400">
                {product.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Type</span>
                  <Badge variant="outline" className="border-white/10">
                    {product.type.charAt(0).toUpperCase() +
                      product.type.slice(1)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Usage Count</span>
                  <span className="text-white">
                    {product.usageCount.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Last Updated</span>
                  <span className="text-white">
                    {new Date(product.lastUpdated).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-gray-400">Status</span>
                  <Switch
                    checked={product.status === "active"}
                    className="data-[state=checked]:bg-blue-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
