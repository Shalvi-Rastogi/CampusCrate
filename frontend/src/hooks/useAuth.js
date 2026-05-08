
import { useEffect, useState } from 'react';

export default function useAuth() {
	const [user, setUser] = useState(null);

	useEffect(() => {
		const stored = localStorage.getItem('user');
		if (stored) {
			setUser(JSON.parse(stored));
		} else {
			setUser(null);
		}
		const handleStorage = () => {
			const updated = localStorage.getItem('user');
			setUser(updated ? JSON.parse(updated) : null);
		};
		window.addEventListener('storage', handleStorage);
		return () => window.removeEventListener('storage', handleStorage);
	}, []);

	return user;
}
