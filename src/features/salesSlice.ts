import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export interface Sale {
  id: string;
  product: string;
  amount: number;
  date: string;
}

interface SalesState {
  data: Sale[];
  loading: boolean;
  error: string | null;
  total: number;
  currentPage: number;
  itemsPerPage: number;
  sortField: string;
  sortDirection: 'asc' | 'desc';
}

const initialState: SalesState = {
  data: [],
  loading: false,
  error: null,
  total: 0,
  currentPage: 1,
  itemsPerPage: 10,
  sortField: 'date',
  sortDirection: 'desc',
};

export const fetchSales = createAsyncThunk(
  'sales/fetchSales',
  async ({ page, limit, sortField, sortDirection }: { 
    page: number; 
    limit: number;
    sortField: string;
    sortDirection: 'asc' | 'desc';
  }) => {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/sales?page=${page}&limit=${limit}&sortField=${sortField}&sortDirection=${sortDirection}`
    );
    return response.data;
  }
);

export const createSale = createAsyncThunk(
  'sales/createSale',
  async (sale: Omit<Sale, 'id'>) => {
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/sales`, sale);
    return response.data;
  }
);

export const updateSale = createAsyncThunk(
  'sales/updateSale',
  async ({ id, ...sale }: Sale) => {
    const response = await axios.put(`${import.meta.env.VITE_API_URL}/sales/${id}`, sale);
    return response.data;
  }
);

export const deleteSale = createAsyncThunk(
  'sales/deleteSale',
  async (id: string) => {
    await axios.delete(`${import.meta.env.VITE_API_URL}/sales/${id}`);
    return id;
  }
);

export const bulkCreateSales = createAsyncThunk(
  'sales/bulkCreateSales',
  async (sales: Omit<Sale, 'id'>[]) => {
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/sales/bulk`, sales);
    return response.data;
  }
);

const salesSlice = createSlice({
  name: 'sales',
  initialState,
  reducers: {
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    setItemsPerPage: (state, action) => {
      state.itemsPerPage = action.payload;
    },
    setSortField: (state, action) => {
      state.sortField = action.payload;
    },
    setSortDirection: (state, action) => {
      state.sortDirection = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSales.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSales.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
        state.total = action.payload.total;
      })
      .addCase(fetchSales.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch sales';
      })
      .addCase(createSale.fulfilled, (state, action) => {
        state.data.push(action.payload);
        state.total += 1;
      })
      .addCase(updateSale.fulfilled, (state, action) => {
        const index = state.data.findIndex((sale) => sale.id === action.payload.id);
        if (index !== -1) {
          state.data[index] = action.payload;
        }
      })
      .addCase(deleteSale.fulfilled, (state, action) => {
        state.data = state.data.filter((sale) => sale.id !== action.payload);
        state.total -= 1;
      })
      .addCase(bulkCreateSales.fulfilled, (state, action) => {
        state.data.push(...action.payload);
        state.total += action.payload.length;
      });
  },
});

export const { setCurrentPage, setItemsPerPage, setSortField, setSortDirection } = salesSlice.actions;
export default salesSlice.reducer;
