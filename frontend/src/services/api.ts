import axios from 'axios';
import { Service, Etablissement, EtablissementAdmin, User, CreateEtablissementData, Avis } from '../types';

export const api = {
  getServices: async (): Promise<Service[]> => {
    const response = await axios.get('/services');
    return response.data;
  },

  createService: async (service: { nom: string; description: string }): Promise<Service> => {
    const response = await axios.post('/services/create', service);
    return response.data;
  },

  deleteService: async (id: number): Promise<{ message: string }> => {
    const urls = [
      `/services/${id}`,
      `/services/${id}/delete`,
      `/admin/services/${id}`,
      `/admin/services/${id}/delete`
    ];
    const methods: Array<'delete' | 'post'> = ['delete', 'post'];
    let lastError: any = null;
    for (const url of urls) {
      for (const method of methods) {
        try {
          const response = await axios.request({ url, method });
          return response.data;
        } catch (e) {
          lastError = e;
        }
      }
    }
    throw lastError || new Error('Delete service request failed');
  },

  getEtablissements: async (): Promise<Etablissement[]> => {
    const response = await axios.get('/etablissements');
    return response.data;
  },

  getEtablissementsAll: async (): Promise<Etablissement[]> => {
    const pageSize = 200;
    let page = 0;
    const all: Etablissement[] = [];

    try {
      const single = await axios.get('/etablissements', { params: { page: 0, size: 1000, limit: 1000 } });
      const data = single.data;
      if (Array.isArray(data)) {
        return data;
      }
      if (data && Array.isArray(data.content)) {
      } else if (data && Array.isArray(data.items)) {
        const items: Etablissement[] = data.items;
        if (!data.nextPage) {
          return items;
        }
      }
    } catch (_) {
    }

    while (true) {
      const resp = await axios.get('/etablissements', { params: { page, size: pageSize, limit: pageSize, offset: page * pageSize } });
      const payload = resp.data;

      if (Array.isArray(payload)) {
        all.push(...payload);
        if (payload.length < pageSize) break;
      } else if (payload && Array.isArray(payload.content)) {
        all.push(...payload.content);
        if (payload.last === true) break;
        if (typeof payload.totalPages === 'number' && page + 1 >= payload.totalPages) break;
        if (payload.content.length < pageSize) break;
      } else if (payload && Array.isArray(payload.items)) {
        all.push(...payload.items);
        if (!payload.nextPage || payload.items.length < pageSize) break;
      } else {
        break;
      }

      page += 1;
      if (page > 1000) break;
    }

    if (all.length === 0) {
      const fallback = await axios.get('/etablissements');
      return fallback.data;
    }

    return all;
  },

  getAllEtablissements: async (): Promise<EtablissementAdmin[]> => {
    const response = await axios.get('/etablissements/admin');
    return response.data;
  },

  getEtablissementsEnAttente: async (): Promise<EtablissementAdmin[]> => {
    const response = await axios.get('/etablissements/admin/en-attente');
    return response.data;
  },

  deleteEtablissement: async (id: number): Promise<{ message: string; status?: string }> => {
    const urls = [
      `/etablissements/admin/${id}`,
      `/etablissements/${id}`,
      `/admin/etablissements/${id}`,
      `/etablissements/admin/${id}/delete`,
      `/etablissements/${id}/delete`
    ];
    const methods: Array<'delete' | 'post'> = ['delete', 'post'];
    let lastError: any = null;
    for (const url of urls) {
      for (const method of methods) {
        try {
          const response = await axios.request({ url, method });
          return response.data;
        } catch (e) {
          lastError = e;
        }
      }
    }
    throw lastError || new Error('Delete etablissement request failed');
  },

  getTuteurEtablissement: async (): Promise<Etablissement> => {
    const response = await axios.get('/tuteur/etablissement');
    return response.data;
  },

  createEtablissement: async (data: CreateEtablissementData): Promise<{ message: string; status: string }> => {
    const response = await axios.post('/tuteur/etablissement', data);
    return response.data;
  },

  updateEtablissement: async (data: CreateEtablissementData): Promise<{ message: string; status: string }> => {
    const urls = [
      '/tuteur/etablissement',
      '/tuteur/etablissement/update',
      `/tuteur/etablissement/${(data as any).id ?? ''}`,
      `/etablissements/${(data as any).id ?? ''}`,
      '/etablissements/update'
    ].filter(Boolean) as string[];
    const methods: Array<'put' | 'patch' | 'post'> = ['put', 'patch', 'post'];
    let lastError: any = null;
    for (const url of urls) {
      for (const method of methods) {
        try {
          const response = await axios.request({ url, method, data });
          return response.data;
        } catch (e) {
          lastError = e;
        }
      }
    }
    throw lastError || new Error('Update etablissement request failed');
  },

  getAllUsers: async (): Promise<User[]> => {
    const response = await axios.get('/user/all');
    return response.data;
  },

  getUserById: async (id: number): Promise<User> => {
    const response = await axios.get(`/user/${id}`);
    return response.data;
  },

  validateEtablissement: async (id: number): Promise<{ message: string }> => {
    const urls = [
      `/etablissements/admin/${id}/validate`,
      `/etablissements/${id}/validate`,
      `/admin/etablissements/${id}/validate`,
      `/etablissements/admin/${id}/valider`,
      `/etablissements/${id}/valider`
    ];
    const methods: Array<'post' | 'put' | 'patch'> = ['post', 'put', 'patch'];
    let lastError: any = null;
    for (const url of urls) {
      for (const method of methods) {
        try {
          const response = await axios.request({ url, method });
          return response.data;
        } catch (e) {
          lastError = e;
        }
      }
    }
    throw lastError || new Error('Validate request failed');
  },

  rejectEtablissement: async (id: number, reason?: string): Promise<{ message: string }> => {
    const payloads = [
      { reason },
      { motif: reason },
      {} as Record<string, unknown>
    ];
    const urls = [
      `/etablissements/admin/${id}/reject`,
      `/etablissements/${id}/reject`,
      `/admin/etablissements/${id}/reject`,
      `/etablissements/admin/${id}/rejeter`,
      `/etablissements/${id}/rejeter`
    ];
    const methods: Array<'post' | 'put' | 'patch'> = ['post', 'put', 'patch'];
    let lastError: any = null;
    for (const url of urls) {
      for (const method of methods) {
        for (const body of payloads) {
          try {
            const response = await axios.request({ url, method, data: body, params: body && Object.keys(body).length === 0 ? (reason ? { reason } : {}) : {} });
            return response.data;
          } catch (e) {
            lastError = e;
          }
        }
      }
    }
    throw lastError || new Error('Reject request failed');
  }
  ,

  getEtablissementById: async (id: number): Promise<Etablissement> => {
    const response = await axios.get(`/etablissements/${id}`);
    return response.data;
  },

  getAvisByEtablissement: async (id: number): Promise<Avis[]> => {
    try {
      const response = await axios.get(`/etablissements/${id}/avis`);
      const raw = response.data;
      const list = Array.isArray(raw) ? raw : Array.isArray(raw?.content) ? raw.content : Array.isArray(raw?.items) ? raw.items : [];
      return list.map((a: any) => {
        const normalizedService = a.service
          ? { ...a.service, id: a.service.id ?? a.service.idService }
          : undefined;
        return {
          ...a,
          id: a.id ?? a.idAvis ?? a.reviewId ?? a._id,
          serviceId: a.serviceId ?? a.service?.idService ?? a.service?.id,
          service: normalizedService,
        };
      });
    } catch (_) {
    }

    const fallback = await axios.get(`/avis/etablissement/${id}`);
    const fraw = fallback.data;
    const flist = Array.isArray(fraw) ? fraw : Array.isArray(fraw?.content) ? fraw.content : Array.isArray(fraw?.items) ? fraw.items : [];
    return flist.map((a: any) => {
      const normalizedService = a.service
        ? { ...a.service, id: a.service.id ?? a.service.idService }
        : undefined;
      return {
        ...a,
        id: a.id ?? a.idAvis ?? a.reviewId ?? a._id,
        serviceId: a.serviceId ?? a.service?.idService ?? a.service?.id,
        service: normalizedService,
      };
    });
  }
  ,

  createAvis: async (
    etablissementId: number,
    note: number,
    commentaire: string,
    serviceId: number
  ): Promise<{ message?: string } | Avis> => {
    // Backend contract provided: POST /avis with body { etablissementId, serviceId, note, commentaire }
    const preferredBody = { etablissementId, serviceId, note, commentaire };
    const variants: Array<Record<string, any>> = [
      preferredBody,
      { etablissementId, serviceId, rating: note, commentaire },
      { etablissementId, serviceId, note, comment: commentaire },
      { etablissement: etablissementId, service: serviceId, note, commentaire },
    ];
    const urls = ['/avis'];
    let lastError: any = null;
    for (const url of urls) {
      for (const body of variants) {
        try {
          const response = await axios.post(url, body);
          return response.data;
        } catch (e) {
          lastError = e;
        }
      }
    }
    throw lastError || new Error('Create avis request failed');
  }
  ,

  deleteAvis: async (id: number, etablissementId?: number): Promise<{ message?: string }> => {
    const urls: string[] = [
      `/admin/avis/${id}`,
      `/avis/${id}`,
      `/avis/${id}/delete`,
    ];
    if (etablissementId) {
      urls.push(
        `/etablissements/${etablissementId}/avis/${id}`,
        `/etablissements/${etablissementId}/avis/${id}/delete`,
        `/etablissements/admin/${etablissementId}/avis/${id}`
      );
    }
    const methods: Array<'delete' | 'post'> = ['delete', 'post'];
    let lastError: any = null;
    for (const url of urls) {
      for (const method of methods) {
        try {
          const response = await axios.request({ url, method });
          return response.data;
        } catch (e) {
          lastError = e;
        }
      }
    }
    throw lastError || new Error('Delete avis request failed');
  }
};