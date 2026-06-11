import { Injectable } from '@nestjs/common';
import { SupabaseService } from './supabase/supabase.service';

@Injectable()
export class AppService {
  constructor(private readonly supabase: SupabaseService) {}

  async getUsers(): Promise<unknown> {
    const { data, error } = await this.supabase.client
      .from('users')
      .select('*');

    if (error) {
      console.error(error);
      throw new Error('Database error');
    }

    return data;
  }
}
