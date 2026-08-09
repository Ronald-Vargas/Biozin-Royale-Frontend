import { Injectable } from '@angular/core';
import {
  createClient,
  SupabaseClient
} from '@supabase/supabase-js';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {

  readonly client: SupabaseClient;

  constructor() {
    this.client = createClient(
      environment.supabaseUrl,
      environment.supabaseKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          // La app nativa (Capacitor) usa exchangeCodeForSession sobre el deep link
          // de vuelta; eso requiere PKCE (?code=...). El default de la librería es
          // 'implicit' (tokens en el fragmento #), que no sirve para ese flujo.
          flowType: 'pkce'
        }
      }
    );
  }
}