'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

export function usePosDevice() {
    const [deviceId, setDeviceId] = useState<string | null>(null);
    const [isRegistered, setIsRegistered] = useState<boolean | null>(null);
    const [deviceInfo, setDeviceInfo] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [limitReached, setLimitReached] = useState<any>(null);

    const validateDevice = async (id: string) => {
        setLoading(true);
        try {
            const res = await api.get(`/staff/pos-devices/validate?deviceId=${id}`);
            if (res.data.isValid) {
                setIsRegistered(true);
                setDeviceInfo(res.data.device);
            } else {
                setIsRegistered(false);
            }
        } catch (err: any) {
            console.error('Failed to validate device:', err);
            setIsRegistered(false);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const storedId = localStorage.getItem('pos_device_id');
        if (storedId) {
            setDeviceId(storedId);
            validateDevice(storedId);
        } else {
            setLoading(false);
            setIsRegistered(false);
        }
    }, []);

    const registerDevice = useCallback(async (name: string) => {
        setLoading(true);
        setLimitReached(null);
        try {
            let id = localStorage.getItem('pos_device_id');
            if (!id) {
                id = crypto.randomUUID();
            }

            const res = await api.post('/staff/pos-devices/register', {
                deviceId: id,
                name
            });

            localStorage.setItem('pos_device_id', id);
            setDeviceId(id);
            setIsRegistered(true);
            setDeviceInfo(res.data);
            return { success: true };
        } catch (err: any) {
            const data = err.response?.data;
            if (err.response?.status === 403 && data?.message === 'POS limit reached') {
                setLimitReached(data);
            }
            return { success: false, error: data?.message || 'Failed to register' };
        } finally {
            setLoading(false);
        }
    }, []);

    const deactivateOtherDevice = useCallback(async (id: string) => {
        try {
            await api.delete(`/staff/pos-devices/${id}`);
            return { success: true };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.message || 'Failed to deactivate' };
        }
    }, []);

    return {
        deviceId,
        isRegistered,
        deviceInfo,
        loading,
        limitReached,
        registerDevice,
        deactivateOtherDevice,
        recheck: () => {
            const id = localStorage.getItem('pos_device_id');
            if (id) validateDevice(id);
        }
    };
}
