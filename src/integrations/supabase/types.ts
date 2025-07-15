export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      blog_comments: {
        Row: {
          blog_id: string
          content: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          blog_id: string
          content: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          blog_id?: string
          content?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_comments_blog_id_fkey"
            columns: ["blog_id"]
            isOneToOne: false
            referencedRelation: "blogs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          }
        ]
      }
      blog_likes: {
        Row: {
          blog_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          blog_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          blog_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_likes_blog_id_fkey"
            columns: ["blog_id"]
            isOneToOne: false
            referencedRelation: "blogs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          }
        ]
      }
      blogs: {
        Row: {
          comments_count: number | null
          content: string
          cover_image_url: string | null
          created_at: string
          id: string
          likes_count: number | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          comments_count?: number | null
          content: string
          cover_image_url?: string | null
          created_at?: string
          id?: string
          likes_count?: number | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          comments_count?: number | null
          content?: string
          cover_image_url?: string | null
          created_at?: string
          id?: string
          likes_count?: number | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blogs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          }
        ]
      }
      communities: {
        Row: {
          category: string
          created_at: string
          description: string
          id: string
          image_url: string | null
          members_count: number | null
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          id?: string
          image_url?: string | null
          members_count?: number | null
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          members_count?: number | null
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "communities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          }
        ]
      }
      community_memberships: {
        Row: {
          community_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          community_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          community_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_memberships_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_memberships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          }
        ]
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          quantity: number
          price_per_item: number
          points_per_item: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          quantity?: number
          price_per_item: number
          points_per_item?: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          price_per_item?: number
          points_per_item?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      orders: {
        Row: {
          id: string
          user_id: string
          total_amount: number
          total_points_used: number
          status: string
          shipping_address: Json | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          total_amount: number
          total_points_used?: number
          status?: string
          shipping_address?: Json | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          total_amount?: number
          total_points_used?: number
          status?: string
          shipping_address?: Json | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          id: string
          order_id: string
          payment_method: string
          amount: number
          points_used: number | null
          transaction_id: string | null
          status: string
          gateway_response: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_id: string
          payment_method: string
          amount: number
          points_used?: number | null
          transaction_id?: string | null
          status?: string
          gateway_response?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          payment_method?: string
          amount?: number
          points_used?: number | null
          transaction_id?: string | null
          status?: string
          gateway_response?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          }
        ]
      }
      products: {
        Row: {
          category: string
          created_at: string
          description: string
          id: string
          image_url: string | null
          name: string
          price_in_points: number
          shop_id: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          id?: string
          image_url?: string | null
          name: string
          price_in_points?: number
          shop_id: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          name?: string
          price_in_points?: number
          shop_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          eco_name: string
          full_name: string | null
          green_points: number | null
          id: string
          location: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          eco_name: string
          full_name?: string | null
          green_points?: number | null
          id?: string
          location?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          eco_name?: string
          full_name?: string | null
          green_points?: number | null
          id?: string
          location?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      shops: {
        Row: {
          category: string
          contact_info: Json | null
          created_at: string
          description: string
          id: string
          image_url: string | null
          location: string
          name: string
          rating: number | null
          updated_at: string
        }
        Insert: {
          category: string
          contact_info?: Json | null
          created_at?: string
          description: string
          id?: string
          image_url?: string | null
          location: string
          name: string
          rating?: number | null
          updated_at?: string
        }
        Update: {
          category?: string
          contact_info?: Json | null
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          location?: string
          name?: string
          rating?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      shopping_cart: {
        Row: {
          id: string
          user_id: string
          product_id: string
          quantity: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          quantity?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          quantity?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shopping_cart_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "shopping_cart_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      stories: {
        Row: {
          comments_count: number | null
          content: string
          created_at: string
          id: string
          image_url: string | null
          likes_count: number | null
          location: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          comments_count?: number | null
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          likes_count?: number | null
          location?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          comments_count?: number | null
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          likes_count?: number | null
          location?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          }
        ]
      }
      story_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          story_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          story_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          story_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_comments_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          }
        ]
      }
      story_likes: {
        Row: {
          created_at: string
          id: string
          story_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          story_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          story_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_likes_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
