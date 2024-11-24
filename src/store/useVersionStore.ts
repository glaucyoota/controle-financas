import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import packageJson from '../../package.json';

interface VersionStore {
	version: string;
	incrementVersion: () => void;
}

export const useVersionStore = create<VersionStore>()(
	persist(
		(set) => ({
			version: packageJson.version,
			incrementVersion: () => set((state) => {
				const [major, minor, patch] = state.version.split('.').map(Number);
				return {version: `${major}.${minor}.${patch + 1}`};
			})
		}),
		{
			name: 'version-storage',
		}
	)
);