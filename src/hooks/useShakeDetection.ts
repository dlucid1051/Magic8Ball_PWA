import { useEffect, useRef, useState, useCallback } from 'react';

export type ShakePermissionState = 'granted' | 'denied' | 'prompt' | 'not-supported';

interface UseShakeDetectionOptions {
  onShake: () => void;
  enabled?: boolean;
  sensitivity?: 'low' | 'medium' | 'high';
}

const THRESHOLD_MAP = {
  high: 12,    // Highly sensitive
  medium: 18,  // Standard firm hand shake
  low: 26,     // Strong deliberate shake
};

export function useShakeDetection({
  onShake,
  enabled = true,
  sensitivity = 'medium',
}: UseShakeDetectionOptions) {
  const [permissionState, setPermissionState] = useState<ShakePermissionState>('prompt');
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [lastMotionMagnitude, setLastMotionMagnitude] = useState<number>(0);

  const lastCoordsRef = useRef<{ x: number; y: number; z: number; time: number } | null>(null);
  const lastShakeTimeRef = useRef<number>(0);
  const isLockedRef = useRef<boolean>(false);
  const onShakeRef = useRef(onShake);
  onShakeRef.current = onShake;

  // Check initial support
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!('DeviceMotionEvent' in window)) {
      setIsSupported(false);
      setPermissionState('not-supported');
      return;
    }

    setIsSupported(true);
    // Universal initial state is 'prompt' (inactive until enabled)
    setPermissionState('prompt');
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    const deviceMotion = window.DeviceMotionEvent as unknown as {
      requestPermission?: () => Promise<'granted' | 'denied'>;
    };

    if (typeof deviceMotion.requestPermission === 'function') {
      try {
        const response = await deviceMotion.requestPermission();
        if (response === 'granted') {
          setPermissionState('granted');
          return true;
        } else {
          setPermissionState('denied');
          return false;
        }
      } catch (err) {
        console.warn('Error requesting DeviceMotionEvent permission:', err);
        setPermissionState('denied');
        return false;
      }
    } else {
      setPermissionState('granted');
      return true;
    }
  }, []);

  const resetPermission = useCallback(() => {
    if (!('DeviceMotionEvent' in window)) {
      setPermissionState('not-supported');
    } else {
      setPermissionState('prompt');
    }
    isLockedRef.current = false;
    lastCoordsRef.current = null;
  }, []);

  // When enabled changes, reset coordinates baseline and unlock if enabling
  useEffect(() => {
    lastCoordsRef.current = null;
    if (enabled) {
      isLockedRef.current = false;
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled || permissionState !== 'granted') {
      lastCoordsRef.current = null;
      return;
    }

    const threshold = THRESHOLD_MAP[sensitivity] || THRESHOLD_MAP.medium;
    // Complete cooldown covering the shake animation and fluid reveal
    const cooldownMs = 2600;

    const handleDeviceMotion = (event: DeviceMotionEvent) => {
      // Synchronous immediate lock out
      if (!enabled || isLockedRef.current) {
        lastCoordsRef.current = null;
        return;
      }

      const accel = event.accelerationIncludingGravity || event.acceleration;
      if (!accel || accel.x === null || accel.y === null || accel.z === null) return;

      const currentTime = performance.now();
      const last = lastCoordsRef.current;

      if (!last) {
        lastCoordsRef.current = {
          x: accel.x,
          y: accel.y,
          z: accel.z,
          time: currentTime,
        };
        return;
      }

      const timeDelta = currentTime - last.time;
      if (timeDelta < 40) return; // 25Hz throttle for stability

      const deltaX = Math.abs(accel.x - last.x);
      const deltaY = Math.abs(accel.y - last.y);
      const deltaZ = Math.abs(accel.z - last.z);

      // Measure total directional impulse
      const deltaImpulse = deltaX + deltaY + deltaZ;
      setLastMotionMagnitude(deltaImpulse);

      if (deltaImpulse > threshold) {
        if (currentTime - lastShakeTimeRef.current > cooldownMs) {
          // Immediately engage synchronous lock to prevent double shake
          isLockedRef.current = true;
          lastShakeTimeRef.current = currentTime;
          lastCoordsRef.current = null;
          onShakeRef.current();
          return;
        }
      }

      lastCoordsRef.current = {
        x: accel.x,
        y: accel.y,
        z: accel.z,
        time: currentTime,
      };
    };

    window.addEventListener('devicemotion', handleDeviceMotion, { passive: true });

    return () => {
      window.removeEventListener('devicemotion', handleDeviceMotion);
      lastCoordsRef.current = null;
    };
  }, [enabled, permissionState, sensitivity]);

  return {
    isSupported,
    permissionState,
    requestPermission,
    resetPermission,
    lastMotionMagnitude,
  };
}
