import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Folder, FileItem, CreateFolderRequest } from '../types';
import { filesApi } from '../api/filesApi';

interface FilesState {
  folders: Folder[];
  currentFolder: Folder | null;
  files: FileItem[];
  isLoading: boolean;
  uploadProgress: { [key: string]: number };
  error: string | null;
}

const initialState: FilesState = {
  folders: [],
  currentFolder: null,
  files: [],
  isLoading: false,
  uploadProgress: {},
  error: null,
};

export const loadFolders = createAsyncThunk(
  'files/loadFolders',
  async (parentFolderId?: string, { rejectWithValue }) => {
    try {
      return await filesApi.getFolders(parentFolderId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'שגיאה בטעינת תקיות');
    }
  }
);

export const createFolder = createAsyncThunk(
  'files/createFolder',
  async (folderData: CreateFolderRequest, { rejectWithValue }) => {
    try {
      return await filesApi.createFolder(folderData);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'שגיאה ביצירת תקיה');
    }
  }
);

export const uploadFiles = createAsyncThunk(
  'files/uploadFiles',
  async ({ files, folderId }: { files: File[]; folderId: string }, { rejectWithValue, dispatch }) => {
    try {
      const uploadPromises = files.map(async (file) => {
        // Method 1: Pre-signed URL (faster)
        const uploadUrlResponse = await filesApi.getUploadUrl({
          fileName: file.name,
          folderId,
        });

        // Upload directly to S3
        await fetch(uploadUrlResponse.uploadUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type,
          },
        });

        return uploadUrlResponse.fileId;
      });

      await Promise.all(uploadPromises);
      return files.length;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'שגיאה בהעלאת קבצים');
    }
  }
);

const filesSlice = createSlice({
  name: 'files',
  initialState,
  reducers: {
    setCurrentFolder: (state, action: PayloadAction<Folder | null>) => {
      state.currentFolder = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateUploadProgress: (state, action: PayloadAction<{ fileId: string; progress: number }>) => {
      state.uploadProgress[action.payload.fileId] = action.payload.progress;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadFolders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadFolders.fulfilled, (state, action: PayloadAction<Folder[]>) => {
        state.isLoading = false;
        state.folders = action.payload;
      })
      .addCase(loadFolders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createFolder.fulfilled, (state, action: PayloadAction<Folder>) => {
        state.folders.push(action.payload);
      })
      .addCase(uploadFiles.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(uploadFiles.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(uploadFiles.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setCurrentFolder, clearError, updateUploadProgress } = filesSlice.actions;
export default filesSlice.reducer;