export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles_star: {
        Row: {
          id: string
          username: string | null
          full_name: string
          bio: string | null
          description: string | null
          avatar_url: string | null
          title: string | null
          location: string | null
          website: string | null
          apology: string | null
          interests: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          username?: string | null
          full_name: string
          bio?: string | null
          description?: string | null
          avatar_url?: string | null
          title?: string | null
          location?: string | null
          website?: string | null
          apology?: string | null
          interests?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          full_name?: string
          bio?: string | null
          description?: string | null
          avatar_url?: string | null
          title?: string | null
          location?: string | null
          website?: string | null
          apology?: string | null
          interests?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      education_star: {
        Row: {
          id: string
          profile_id: string
          institution: string
          degree: string
          field_of_study: string | null
          start_date: string | null
          end_date: string | null
          description: string | null
          location: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          institution: string
          degree: string
          field_of_study?: string | null
          start_date?: string | null
          end_date?: string | null
          description?: string | null
          location?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          institution?: string
          degree?: string
          field_of_study?: string | null
          start_date?: string | null
          end_date?: string | null
          description?: string | null
          location?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      experience_star: {
        Row: {
          id: string
          profile_id: string
          company: string
          position: string
          start_date: string | null
          end_date: string | null
          current: boolean | null
          description: string | null
          location: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          company: string
          position: string
          start_date?: string | null
          end_date?: string | null
          current?: boolean | null
          description?: string | null
          location?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          company?: string
          position?: string
          start_date?: string | null
          end_date?: string | null
          current?: boolean | null
          description?: string | null
          location?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      skills_star: {
        Row: {
          id: string
          profile_id: string
          name: string
          category: string | null
          proficiency: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          name: string
          category?: string | null
          proficiency?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          name?: string
          category?: string | null
          proficiency?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      social_links_star: {
        Row: {
          id: string
          profile_id: string
          platform: string
          url: string
          icon: string | null
          display_name: string | null
          active: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          platform: string
          url: string
          icon?: string | null
          display_name?: string | null
          active?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          platform?: string
          url?: string
          icon?: string | null
          display_name?: string | null
          active?: boolean | null
          created_at?: string
          updated_at?: string
        }
      }
      settings_star: {
        Row: {
          id: string
          key: string
          value: Json
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value: Json
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: Json
          updated_at?: string
        }
      }
      posts_star: {
        Row: {
          id: string
          title: string
          content: string
          excerpt: string | null
          image_url: string | null
          author_id: string
          published: boolean | null
          featured: boolean | null
          tags: string[] | null
          created_at: string
          updated_at: string
          likes: number | null
        }
        Insert: {
          id?: string
          title: string
          content: string
          excerpt?: string | null
          image_url?: string | null
          author_id: string
          published?: boolean | null
          featured?: boolean | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
          likes?: number | null
        }
        Update: {
          id?: string
          title?: string
          content?: string
          excerpt?: string | null
          image_url?: string | null
          author_id?: string
          published?: boolean | null
          featured?: boolean | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
          likes?: number | null
        }
      }
      events_star: {
        Row: {
          id: string
          title: string
          description: string | null
          location: string | null
          start_date: string
          end_date: string | null
          image_url: string | null
          event_url: string | null
          tags: string[] | null
          published: boolean | null
          created_at: string
          updated_at: string
          likes: number | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          location?: string | null
          start_date: string
          end_date?: string | null
          image_url?: string | null
          event_url?: string | null
          tags?: string[] | null
          published?: boolean | null
          created_at?: string
          updated_at?: string
          likes?: number | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          location?: string | null
          start_date?: string
          end_date?: string | null
          image_url?: string | null
          event_url?: string | null
          tags?: string[] | null
          published?: boolean | null
          created_at?: string
          updated_at?: string
          likes?: number | null
        }
      }
      projects_star: {
        Row: {
          id: string
          title: string
          description: string
          image_url: string | null
          technologies: string[] | null
          github_url: string | null
          demo_url: string | null
          featured: boolean | null
          created_at: string
          updated_at: string
          likes: number | null
        }
        Insert: {
          id?: string
          title: string
          description: string
          image_url?: string | null
          technologies?: string[] | null
          github_url?: string | null
          demo_url?: string | null
          featured?: boolean | null
          created_at?: string
          updated_at?: string
          likes?: number | null
        }
        Update: {
          id?: string
          title?: string
          description?: string
          image_url?: string | null
          technologies?: string[] | null
          github_url?: string | null
          demo_url?: string | null
          featured?: boolean | null
          created_at?: string
          updated_at?: string
          likes?: number | null
        }
      }
      tasks_star: {
        Row: {
          id: string
          title: string
          description: string
          status: string | null
          completion: number | null
          tags: string[] | null
          timeline: string | null
          client: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          status?: string | null
          completion?: number | null
          tags?: string[] | null
          timeline?: string | null
          client?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          status?: string | null
          completion?: number | null
          tags?: string[] | null
          timeline?: string | null
          client?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      videos_star: {
        Row: {
          id: string
          title: string
          description: string | null
          video_id: string
          thumbnail_url: string | null
          category: string | null
          published_at: string
          likes: number | null
          featured: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          video_id: string
          thumbnail_url?: string | null
          category?: string | null
          published_at?: string
          likes?: number | null
          featured?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          video_id?: string
          thumbnail_url?: string | null
          category?: string | null
          published_at?: string
          likes?: number | null
          featured?: boolean | null
          created_at?: string
          updated_at?: string
        }
      }
      images: {
        Row: {
          id: string
          title: string
          url: string
          category: string | null
          created_at: string
          updated_at: string
          likes: number | null
        }
        Insert: {
          id?: string
          title: string
          url: string
          category?: string | null
          created_at?: string
          updated_at?: string
          likes?: number | null
        }
        Update: {
          id?: string
          title?: string
          url?: string
          category?: string | null
          created_at?: string
          updated_at?: string
          likes?: number | null
        }
      }
    }
  }
}

