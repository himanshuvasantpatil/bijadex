import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { 
  X, 
  Camera, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  Barcode as BarcodeIcon,
  Search
} from 'lucide-react';
import { formatCurrency } from '../utils/format';

export const ScannerModal: React.FC = () => {
  const { 
    isScannerOpen, 
    closeScanner, 
    handleBarcodeScan, 
    products,
    scannerTarget
  } = useApp();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);

  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [lastScannedResult, setLastScannedResult] = useState<{
    code: string;
    productName?: string;
    price?: number;
    found: boolean;
    timestamp: number;
  } | null>(null);

  // Stop camera tracks cleanly
  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  }, []);

  // Initialize camera list
  useEffect(() => {
    if (!isScannerOpen) {
      stopCamera();
      return;
    }

    navigator.mediaDevices?.enumerateDevices()
      .then(deviceInfos => {
        const videoDevices = deviceInfos.filter(d => d.kind === 'videoinput');
        setDevices(videoDevices);
        if (videoDevices.length > 0 && !selectedDeviceId) {
          // Prefer environment (back) camera on laptops/tablets if available
          const backCam = videoDevices.find(d => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('environment'));
          setSelectedDeviceId(backCam ? backCam.deviceId : videoDevices[0].deviceId);
        }
      })
      .catch(err => {
        console.warn('Could not enumerate video devices', err);
      });

    return () => {
      stopCamera();
    };
  }, [isScannerOpen, selectedDeviceId, stopCamera]);

  // Start ZXing camera scanning
  useEffect(() => {
    if (!isScannerOpen) return;

    let isMounted = true;
    const reader = new BrowserMultiFormatReader();
    readerRef.current = reader;

    const startScan = async () => {
      try {
        setCameraError(null);
        setIsScanning(true);

        const constraints: MediaStreamConstraints = {
          video: selectedDeviceId ? { deviceId: { exact: selectedDeviceId } } : { facingMode: 'environment' }
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (!isMounted) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute('playsinline', 'true');
          await videoRef.current.play();

          // Continuous decode
          reader.decodeFromVideoElement(videoRef.current, (result, err) => {
            if (!isMounted) return;
            if (result) {
              const text = result.getText();
              const scanResult = handleBarcodeScan(text);
              setLastScannedResult({
                code: text,
                productName: scanResult.product?.name,
                price: scanResult.product?.sellingPrice,
                found: scanResult.found,
                timestamp: Date.now()
              });
            }
          });
        }
      } catch (err: unknown) {
        if (!isMounted) return;
        const msg = err instanceof Error ? err.message : 'Camera access denied or unavailable.';
        setCameraError(msg);
        setIsScanning(false);
      }
    };

    startScan();

    return () => {
      isMounted = false;
      stopCamera();
    };
  }, [isScannerOpen, selectedDeviceId, handleBarcodeScan, stopCamera]);

  // Manual code input
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    const result = handleBarcodeScan(manualCode.trim());
    setLastScannedResult({
      code: manualCode.trim(),
      productName: result.product?.name,
      price: result.product?.sellingPrice,
      found: result.found,
      timestamp: Date.now()
    });
    setManualCode('');
  };

  // Quick simulate scan from demo items
  const handleQuickScan = (barcode: string) => {
    const result = handleBarcodeScan(barcode);
    setLastScannedResult({
      code: barcode,
      productName: result.product?.name,
      price: result.product?.sellingPrice,
      found: result.found,
      timestamp: Date.now()
    });
  };

  if (!isScannerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-600/40 flex items-center justify-center text-emerald-400">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                Real-Time Barcode Scanner
                <span className="text-[11px] font-mono text-emerald-400 font-normal">
                  Target: {scannerTarget.toUpperCase()}
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Hold product barcode in front of camera or use quick testing panel below
              </p>
            </div>
          </div>

          <button
            onClick={closeScanner}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 overflow-y-auto flex-1 p-5 gap-6">
          {/* Left: Viewfinder Camera Feed (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-3">
            <div className="relative aspect-video w-full bg-slate-950 rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center">
              {/* Camera Video Stream */}
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                muted
                playsInline
              />

              {/* Viewfinder Reticle & Laser Beam Overlay */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-8">
                <div className="relative w-4/5 h-3/5 border-2 border-emerald-500/50 rounded-lg">
                  {/* Reticle Corner Brackets */}
                  <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-emerald-400" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-emerald-400" />
                  <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-emerald-400" />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-emerald-400" />

                  {/* Animated Laser Scanning Line */}
                  <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-rose-500 to-transparent shadow-[0_0_12px_rgba(244,63,94,0.9)] animate-pulse" 
                       style={{ animationDuration: '1.8s' }} />

                  <div className="absolute bottom-2 inset-x-0 text-center">
                    <span className="text-[10px] font-mono text-emerald-300 bg-slate-950/80 px-2 py-0.5 rounded">
                      Align Barcode Inside Frame
                    </span>
                  </div>
                </div>
              </div>

              {/* Fallback if camera error */}
              {cameraError && (
                <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-6 text-center">
                  <AlertCircle className="w-10 h-10 text-amber-400 mb-2" />
                  <p className="text-sm font-semibold text-slate-200">Camera Feed Inactive</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs">{cameraError}</p>
                  <p className="text-xs text-emerald-400 mt-3 font-medium">
                    You can still scan using the Quick Test Barcodes on the right or type manually!
                  </p>
                </div>
              )}
            </div>

            {/* Camera Selector Bar */}
            <div className="flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-400">
                <Camera className="w-3.5 h-3.5" />
                <span>Camera Device:</span>
                <select
                  value={selectedDeviceId}
                  onChange={e => setSelectedDeviceId(e.target.value)}
                  className="bg-slate-800 text-slate-200 text-xs px-2 py-1 rounded border border-slate-700 outline-none focus:border-emerald-500 max-w-[200px] truncate"
                >
                  {devices.length === 0 && <option value="">Default Web Camera</option>}
                  {devices.map(device => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label || `Camera ${device.deviceId.slice(0, 5)}...`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>{isScanning ? 'Scanner Active' : 'Idle'}</span>
              </div>
            </div>

            {/* Manual Code Input Bar */}
            <form onSubmit={handleManualSubmit} className="flex gap-2 mt-1">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Or enter barcode / SKU manually (e.g. 097855175235)"
                  value={manualCode}
                  onChange={e => setManualCode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs px-3 py-2 pl-8 rounded-lg outline-none focus:border-emerald-500 font-mono"
                />
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors border border-slate-700"
              >
                Scan Code
              </button>
            </form>
          </div>

          {/* Right: Instant Test Barcodes & Feedback (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Last Scanned Result Pill */}
            {lastScannedResult && (
              <div className={`p-3 rounded-lg border text-xs ${
                lastScannedResult.found 
                  ? 'bg-emerald-950/40 border-emerald-700/50 text-emerald-200' 
                  : 'bg-amber-950/40 border-amber-700/50 text-amber-200'
              }`}>
                <div className="flex items-center gap-2 font-semibold">
                  {lastScannedResult.found ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                  )}
                  <span>{lastScannedResult.found ? 'Scan Successful' : 'Unrecognized Barcode'}</span>
                </div>
                <div className="mt-1 font-mono text-[11px] text-slate-300">
                  Code: <span className="text-white font-bold">{lastScannedResult.code}</span>
                </div>
                {lastScannedResult.productName && (
                  <div className="mt-1 text-slate-200 font-medium">
                    {lastScannedResult.productName} · {lastScannedResult.price ? formatCurrency(lastScannedResult.price) : ''}
                  </div>
                )}
                {lastScannedResult.found && scannerTarget === 'pos' && (
                  <div className="mt-1 text-[11px] text-emerald-400">
                    Added to POS billing cart.
                  </div>
                )}
              </div>
            )}

            {/* Quick-Scan Simulation Drawer */}
            <div className="flex-1 flex flex-col min-h-0 bg-slate-950/70 border border-slate-800 rounded-lg p-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Interactive Test Barcodes</span>
                </div>
                <span className="text-[10px] text-slate-500">Click to scan instantly</span>
              </div>

              <p className="text-[11px] text-slate-400 mb-2 leading-relaxed">
                Click any product below to trigger the exact hardware scanner event, sound tone, and cart addition:
              </p>

              <div className="space-y-1.5 overflow-y-auto pr-1 flex-1 max-h-[300px]">
                {products.slice(0, 8).map(prod => (
                  <div
                    key={prod.id}
                    onClick={() => handleQuickScan(prod.barcode)}
                    className="flex items-center justify-between p-2 rounded-md bg-slate-900 hover:bg-slate-850 hover:border-emerald-500/50 border border-slate-800/80 cursor-pointer transition-colors group"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="text-xs font-medium text-slate-200 group-hover:text-emerald-300 truncate">
                        {prod.name}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono mt-0.5">
                        <span className="text-slate-400">{prod.barcode}</span>
                        <span aria-hidden="true">·</span>
                        <span>Stock: {prod.stock}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-mono font-semibold text-white tabular-nums">
                        {formatCurrency(prod.sellingPrice)}
                      </div>
                      <span className="inline-block text-[10px] text-emerald-400 font-medium group-hover:underline">
                        Simulate Scan →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <BarcodeIcon className="w-4 h-4 text-slate-500" />
            <span>USB Handheld Barcode Guns: Ready. Just pull trigger anytime in app.</span>
          </div>
          <button
            onClick={closeScanner}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors text-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
