"use client";

import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { X, MapPin, Navigation } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';

// Fix Leaflet icons issue when imported in Next.js/React
// We simply use generic SVG or external URLs for markers
const customIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// A component that updates the marker position when the map is clicked
function MapClickHandler({ setPosition }: { setPosition: (pos: [number, number]) => void }) {
    useMapEvents({
        click(e) {
            setPosition([e.latlng.lat, e.latlng.lng]);
        },
    });
    return null;
}

// A component that centers the map when the position changes externally
function RecenterMap({ position }: { position: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.setView(position);
    }, [position, map]);
    return null;
}

interface LocationPickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (lat: number, lng: number) => void;
    initialLat?: number;
    initialLng?: number;
}

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({ isOpen, onClose, onConfirm, initialLat, initialLng }) => {
    const { t } = useLanguage();
    
    // Default to Riyadh, KSA if no initial coordinates are passed
    const defaultCenter: [number, number] = [24.7136, 46.6753];
    const [position, setPosition] = useState<[number, number]>(
        initialLat && initialLng ? [initialLat, initialLng] : defaultCenter
    );

    useEffect(() => {
        if (isOpen) {
            if (initialLat !== undefined && initialLng !== undefined) {
                setPosition([Number(initialLat), Number(initialLng)]);
            } else {
                setPosition(defaultCenter);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, initialLat, initialLng]);

    const handleUseMyLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setPosition([pos.coords.latitude, pos.coords.longitude]);
                },
                (err) => {
                    console.error("Error getting location", err);
                }
            );
        }
    };

    useEffect(() => {
        if (isOpen) {
            // Give the browser a moment to render the modal before recalculating map size
            const timer = setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose} />
            
            <div className="relative w-full max-w-3xl bg-card border border-border shadow-2xl rounded-2xl animate-in zoom-in-95 duration-200 flex flex-col overflow-hidden max-h-[85vh]">
                <div className="p-4 border-b border-border flex items-center justify-between bg-card shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                            <MapPin className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-foreground leading-tight">{t('select_location') || 'Select Location'}</h2>
                            <p className="text-xs text-muted-foreground">{t('click_map_to_pin') || 'Click anywhere on the map to set the exact coordinates.'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={handleUseMyLocation}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold rounded-lg transition-colors border border-primary/20"
                        >
                            <Navigation className="h-3.5 w-3.5" />
                            {t('use_my_location') || 'Use My Location'}
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-muted rounded-xl transition-colors shrink-0">
                            <X className="h-5 w-5 text-muted-foreground" />
                        </button>
                    </div>
                </div>
                
                <div className="w-full bg-muted/30 relative overflow-hidden" style={{ height: '450px' }}>
                    {/* The map container requires a specific height */}
                    <MapContainer 
                        center={position} 
                        zoom={13} 
                        style={{ height: '450px', width: '100%' }}
                        className="z-0"
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker 
                            position={position} 
                            icon={customIcon} 
                            draggable={true}
                            eventHandlers={{
                                dragend: (e) => {
                                    const marker = e.target;
                                    const loc = marker.getLatLng();
                                    setPosition([loc.lat, loc.lng]);
                                }
                            }}
                        />
                        <MapClickHandler setPosition={setPosition} />
                        <RecenterMap position={position} />
                    </MapContainer>
                </div>
                
                <div className="p-4 bg-muted/50 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border shrink-0">
                    <div className="flex gap-4">
                        <div className="bg-card px-3 py-1.5 rounded-lg border border-border shadow-sm">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-0.5">{t('latitude') || 'Latitude'}</span>
                            <span className="text-sm font-bold text-foreground">{position[0].toFixed(6)}</span>
                        </div>
                        <div className="bg-card px-3 py-1.5 rounded-lg border border-border shadow-sm">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-0.5">{t('longitude') || 'Longitude'}</span>
                            <span className="text-sm font-bold text-foreground">{position[1].toFixed(6)}</span>
                        </div>
                    </div>
                    
                    <div className="flex w-full sm:w-auto gap-3">
                        <button 
                            onClick={onClose} 
                            className="flex-1 px-4 py-2 bg-card border border-border text-foreground hover:bg-muted font-bold rounded-lg transition-colors"
                        >
                            {t('cancel')}
                        </button>
                        <button 
                            onClick={() => {
                                onConfirm(position[0], position[1]);
                                onClose();
                            }} 
                            className="flex-1 px-6 py-2 bg-primary hover:bg-primary text-white font-bold rounded-lg shadow-md hover:shadow-lg hover:shadow-success-500/20 transition-all active:scale-95"
                        >
                            {t('confirm_location') || 'Confirm Location'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

