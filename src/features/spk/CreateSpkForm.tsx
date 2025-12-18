import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from "@/stores/authStore";
import { api } from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import CameraCapture from "@/components/CameraCapture";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CreateSpkForm() {
    const navigate = useNavigate();
    const { id: editId } = useParams(); // Get ID from ID
    const user = useAuthStore((state) => state.user);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("customer");

    // Camera/Media State
    const [showCamera, setShowCamera] = useState<{ isOpen: boolean; field: string | null }>({ isOpen: false, field: null });
    const [uploading, setUploading] = useState(false);

    // Data Sources
    const [vehicleTypes, setVehicleTypes] = useState<any[]>([]);
    const [colors, setColors] = useState<any[]>([]);
    const [salesProfileId, setSalesProfileId] = useState<number | null>(null);
    const [nextSpkNumber, setNextSpkNumber] = useState<string>("Loading...");

    // Form State
    const [formData, setFormData] = useState({
        // Root / Customer
        namaCustomer: '',
        pekerjaanCustomer: '',
        emailCustomer: '',
        namaDebitur: '',
        alamatCustomer: '',
        noTeleponCustomer: '',

        // Paper Info (Mapped to detailInfo in backend)
        namaBpkbStnk: '',
        alamatBpkbStnk: '',
        kotaBpkbStnk: '',

        // Unit Info
        vehicleType: '',
        hargaOtr: 0,
        noMesin: '',
        noRangka: '',
        color: '',
        tahun: new Date().getFullYear().toString(),
        bonus: '',
        lainLain: '',

        // Payment Info
        caraBayar: 'TUNAI',
        angsuran: 0,
        tandaJadi: 0,
        tenor: '0',
        namaLeasing: '',
        dp: 0,
        pembelianVia: '',
        keterangan: '',

        // Media IDs
        ktpId: null as number | null,
        kkId: null as number | null,
        selfieId: null as number | null,

        // Media URLs for Preview
        ktpUrl: '',
        kkUrl: '',
        selfieUrl: '',
    });

    // Helper: Generate SPK Number
    const generateSpkNumber = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let randomCode = '';
        for (let i = 0; i < 5; i++) {
            randomCode += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        const date = new Date();
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const romanMonths = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
        const romanMonth = romanMonths[month - 1];
        return `${randomCode}/SPK/${romanMonth}/${year}`;
    };

    // 1. Fetch Initial Data
    useEffect(() => {
        const initData = async () => {
            if (!user) return;

            // A. Fetch Static Data & Profile
            try {
                const [typeRes, colorRes, profileRes] = await Promise.all([
                    api.get('/vehicle-types'),
                    api.get('/colors'),
                    api.get('/sales-profiles', { params: { filters: { email: { $eq: user.email } }, populate: '*' } })
                ]);

                setVehicleTypes(typeRes.data?.data || []);
                setColors(colorRes.data?.data || []);

                if (profileRes.data?.data?.length > 0) {
                    const profile = profileRes.data.data[0];
                    setSalesProfileId(profile.documentId || profile.id);
                } else {
                    console.warn("Sales Profile not found for", user.email);
                }
            } catch (error) {
                console.error("Static data init failed", error);
            }

            // B. Fetch SPK Data (If Edit) or Setup New
            if (editId) {
                try {
                    // console.log("Fetching SPK ID (Filter):", editId);
                    // Use Filter instead of ID lookup to avoid 500
                    const spkRes = await api.get('/spks', {
                        params: {
                            filters: { documentId: { $eq: editId } },
                            populate: '*'
                        }
                    });
                    // console.log("SPK Fetch Response:", spkRes.data);

                    const spkData = spkRes.data?.data; // Handle { data: [...] }
                    const spk = Array.isArray(spkData) ? spkData[0] : spkData; // Handle if by accident it returns array

                    if (spk) {
                        // console.log("Populating Form with:", spk);
                        // Populate Form
                        setNextSpkNumber(spk.noSPK);
                        setFormData(prev => ({
                            ...prev,
                            // Root
                            namaCustomer: spk.namaCustomer || '',
                            pekerjaanCustomer: spk.pekerjaanCustomer || '',
                            emailCustomer: spk.emailcustomer || '',
                            namaDebitur: spk.namaDebitur || '',
                            alamatCustomer: spk.alamatCustomer || '',
                            noTeleponCustomer: spk.noTeleponCustomer || '',

                            // Detail Info
                            namaBpkbStnk: spk.detailInfo?.namaBpkbStnk || '',
                            alamatBpkbStnk: spk.detailInfo?.alamatBpkbStnk || '',
                            kotaBpkbStnk: spk.detailInfo?.kotaStnkBpkb || '',

                            // Unit Info
                            vehicleType: spk.unitInfo?.vehicleType?.documentId || spk.unitInfo?.vehicleType?.id?.toString() || '',
                            hargaOtr: spk.unitInfo?.hargaOtr || 0,
                            noMesin: spk.unitInfo?.noMesin || '',
                            noRangka: spk.unitInfo?.noRangka || '',
                            color: spk.unitInfo?.color?.documentId || spk.unitInfo?.color?.id?.toString() || '',
                            tahun: spk.unitInfo?.tahun || '',
                            bonus: spk.unitInfo?.bonus || '',
                            lainLain: spk.unitInfo?.lainLain || '',

                            // Payment Info
                            caraBayar: spk.paymentInfo?.caraBayar || 'TUNAI',
                            angsuran: spk.paymentInfo?.angsuran || 0,
                            tandaJadi: spk.paymentInfo?.tandaJadi || 0,
                            tenor: spk.paymentInfo?.tenor || '0',
                            namaLeasing: spk.paymentInfo?.namaLeasing || '',
                            dp: spk.paymentInfo?.dp || 0,
                            pembelianVia: spk.paymentInfo?.pembelianVia || '',
                            keterangan: spk.paymentInfo?.keterangan || '',

                            // Media
                            ktpId: spk.ktpPaspor?.id || null,
                            ktpUrl: spk.ktpPaspor?.url || '',
                            kkId: spk.kartuKeluarga?.id || null,
                            kkUrl: spk.kartuKeluarga?.url || '',
                            selfieId: spk.selfie?.id || null,
                            selfieUrl: spk.selfie?.url || '',
                        }));
                    } else {
                        console.error("SPK data not found in response");
                    }
                } catch (err) {
                    console.error("Failed to fetch SPK details", err);
                    alert("Failed to load SPK data.");
                }
            } else {
                // Create Mode
                const newSpk = generateSpkNumber();
                setNextSpkNumber(newSpk);
                const saved = localStorage.getItem('spk_draft');
                if (saved) setFormData(JSON.parse(saved));
            }

            setInitialLoading(false);
        };
        initData();
    }, [user, editId]);

    // Update Field Helper
    const setField = (field: string, val: any) => {
        setFormData(prev => ({ ...prev, [field]: val }));
    };

    // Price Automator (Only if not editing or explicit user change? simplified to always run for now but check if empty)
    useEffect(() => {
        if (editId && formData.hargaOtr > 0) return; // Don't overwrite existing price on edit load

        const vId = formData.vehicleType;
        if (!vId) return;
        const selectedVehicle = vehicleTypes.find((v: any) =>
            v.id.toString() === vId || (v.documentId && v.documentId === vId)
        );
        if (selectedVehicle) {
            const attr = selectedVehicle.attributes || selectedVehicle;
            const price = attr.harga_otr || attr.price || 0;
            // Only autofill if 0
            if (!formData.hargaOtr) {
                setField('hargaOtr', price);
            }
        }
    }, [formData.vehicleType, vehicleTypes, editId]);

    // Media Upload Logic (Upload on Select)
    const uploadFileToStrapi = async (file: File, fieldName: 'ktp' | 'kk' | 'selfie') => {
        setUploading(true);
        try {
            const data = new FormData();
            data.append('files', file);

            const uploadRes = await api.post('/upload', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (uploadRes.data && uploadRes.data.length > 0) {
                const uploadedFile = uploadRes.data[0];
                const fileId = uploadedFile.id;
                const fileUrl = uploadedFile.url;

                if (fieldName === 'ktp') {
                    setFormData(prev => ({ ...prev, ktpId: fileId, ktpUrl: fileUrl }));
                } else if (fieldName === 'kk') {
                    setFormData(prev => ({ ...prev, kkId: fileId, kkUrl: fileUrl }));
                } else if (fieldName === 'selfie') {
                    setFormData(prev => ({ ...prev, selfieId: fileId, selfieUrl: fileUrl }));
                }
            }
        } catch (error: any) {
            console.error("Upload failed", error);
            alert(`Upload failed: ${error.response?.data?.error?.message || "Check connection"}`);
        } finally {
            setUploading(false);
            setShowCamera({ isOpen: false, field: null });
        }
    };

    const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'ktp' | 'kk' | 'selfie') => {
        if (!e.target.files || e.target.files.length === 0) return;
        uploadFileToStrapi(e.target.files[0], fieldName);
    };

    // Navigation Logic
    const nextTab = (target: string) => {
        if (!editId) {
            localStorage.setItem('spk_draft', JSON.stringify(formData));
        }
        setActiveTab(target);
    };

    const handleSubmit = async () => {
        if (!salesProfileId) {
            alert("Sales Profile not linked.");
            return;
        }

        setLoading(true);
        try {
            const safePayload = {
                data: {
                    noSPK: nextSpkNumber,
                    salesProfile: salesProfileId,
                    tanggal: new Date().toISOString().split('T')[0],

                    // Customer & Root
                    namaCustomer: formData.namaCustomer,
                    pekerjaanCustomer: formData.pekerjaanCustomer || '-',
                    emailcustomer: formData.emailCustomer,
                    namaDebitur: formData.namaDebitur,
                    alamatCustomer: formData.alamatCustomer,
                    kotacustomer: formData.kotaBpkbStnk,
                    noTeleponCustomer: formData.noTeleponCustomer,

                    // Paper Info (Mapped to detailInfo)
                    detailInfo: {
                        namaBpkbStnk: formData.namaBpkbStnk,
                        alamatBpkbStnk: formData.alamatBpkbStnk,
                        kotaStnkBpkb: formData.kotaBpkbStnk,
                    },

                    // Unit Info
                    unitInfo: {
                        vehicleType: formData.vehicleType,
                        hargaOtr: Number(formData.hargaOtr),
                        noMesin: formData.noMesin,
                        noRangka: formData.noRangka,
                        color: formData.color,
                        tahun: String(formData.tahun),
                        bonus: formData.bonus,
                        lainLain: formData.lainLain
                    },

                    // Payment Info
                    paymentInfo: {
                        caraBayar: formData.caraBayar,
                        angsuran: String(formData.angsuran),
                        tandaJadi: String(formData.tandaJadi),
                        tenor: String(formData.tenor),
                        namaLeasing: formData.namaLeasing,
                        dp: Number(formData.dp),
                        pembelianVia: formData.pembelianVia,
                        keterangan: formData.keterangan
                    },

                    // Media (IDs)
                    ktpPaspor: formData.ktpId,
                    kartuKeluarga: formData.kkId,
                    selfie: formData.selfieId
                }
            };

            if (editId) {
                // Update
                await api.put(`/spks/${editId}`, safePayload);
                alert("SPK Updated Successfully!");
            } else {
                // Create
                await api.post('/spks', safePayload);
                localStorage.removeItem('spk_draft');
                alert("SPK Created Successfully!");
            }
            navigate('/spk');
        } catch (error: any) {
            console.error("Submission error", error);
            const msg = error.response?.data?.error?.message;
            alert(`Failed: ${msg || "Unknown error"}`);
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) return <div className="p-8 text-center">Loading Form...</div>;

    return (
        <div className="max-w-xl mx-auto pb-20">
            <h2 className="text-2xl font-bold mb-4">{editId ? 'Edit SPK' : 'New SPK'} <span className="text-sm font-normal text-slate-500">{nextSpkNumber}</span></h2>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-4">
                    <TabsTrigger value="customer">Cust</TabsTrigger>
                    <TabsTrigger value="unit">Unit</TabsTrigger>
                    <TabsTrigger value="payment">Pay</TabsTrigger>
                    <TabsTrigger value="media">Media</TabsTrigger>
                </TabsList>

                {/* TAB 1: CUSTOMER */}
                <TabsContent value="customer">
                    <Card>
                        <CardHeader><CardTitle>A. Customer Information</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Nama Customer</Label>
                                <Input value={formData.namaCustomer} onChange={e => setField('namaCustomer', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Pekerjaan Customer</Label>
                                <Input value={formData.pekerjaanCustomer} onChange={e => setField('pekerjaanCustomer', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Email Customer</Label>
                                <Input type="email" value={formData.emailCustomer} onChange={e => setField('emailCustomer', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Nama Debitur</Label>
                                <Input value={formData.namaDebitur} onChange={e => setField('namaDebitur', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>No Telepon</Label>
                                <Input type="tel" value={formData.noTeleponCustomer} onChange={e => setField('noTeleponCustomer', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Alamat Customer</Label>
                                <Input value={formData.alamatCustomer} onChange={e => setField('alamatCustomer', e.target.value)} />
                            </div>

                            <div className="pt-4 border-t">
                                <h3 className="font-semibold mb-2">Paper Information</h3>
                                <div className="space-y-2 mb-2">
                                    <Label>Nama BPKB/STNK</Label>
                                    <Input value={formData.namaBpkbStnk} onChange={e => setField('namaBpkbStnk', e.target.value)} />
                                </div>
                                <div className="space-y-2 mb-2">
                                    <Label>Alamat STNK</Label>
                                    <Input value={formData.alamatBpkbStnk} onChange={e => setField('alamatBpkbStnk', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Kota STNK/BPKB</Label>
                                    <Input value={formData.kotaBpkbStnk} onChange={e => setField('kotaBpkbStnk', e.target.value)} />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" onClick={() => nextTab('unit')}>Next</Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                {/* TAB 2: UNIT */}
                <TabsContent value="unit">
                    <Card>
                        <CardHeader><CardTitle>B. Unit Details</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Vehicle Type</Label>
                                <Select value={formData.vehicleType} onValueChange={v => setField('vehicleType', v)}>
                                    <SelectTrigger><SelectValue placeholder="Select Vehicle" /></SelectTrigger>
                                    <SelectContent>
                                        {vehicleTypes.map((v: any) => (
                                            <SelectItem key={v.id} value={v.documentId?.toString() || v.id.toString()}>
                                                {v.attributes?.name || v.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Harga OTR</Label>
                                <Input type="number" value={formData.hargaOtr} onChange={e => setField('hargaOtr', e.target.value)} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>No Mesin</Label>
                                    <Input value={formData.noMesin} onChange={e => setField('noMesin', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>No Rangka</Label>
                                    <Input value={formData.noRangka} onChange={e => setField('noRangka', e.target.value)} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Color</Label>
                                <Select value={formData.color} onValueChange={v => setField('color', v)}>
                                    <SelectTrigger><SelectValue placeholder="Select Color" /></SelectTrigger>
                                    <SelectContent>
                                        {colors.map((c: any) => (
                                            <SelectItem key={c.id} value={c.documentId?.toString() || c.id.toString()}>
                                                {c.attributes?.colorname || c.colorname || c.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Tahun</Label>
                                <Input type="number" value={formData.tahun} onChange={e => setField('tahun', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Bonus</Label>
                                <Textarea value={formData.bonus} onChange={e => setField('bonus', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Tambahan Lainnya</Label>
                                <Input value={formData.lainLain} onChange={e => setField('lainLain', e.target.value)} />
                            </div>
                        </CardContent>
                        <CardFooter className="flex gap-2">
                            <Button variant="outline" className="flex-1" onClick={() => nextTab('customer')}>Back</Button>
                            <Button className="flex-1" onClick={() => nextTab('payment')}>Next</Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                {/* TAB 3: PAYMENT */}
                <TabsContent value="payment">
                    <Card>
                        <CardHeader><CardTitle>C. Payment Information</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Cara Bayar</Label>
                                <Select value={formData.caraBayar} onValueChange={v => setField('caraBayar', v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="TUNAI">TUNAI</SelectItem>
                                        <SelectItem value="KREDIT">KREDIT</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Angsuran</Label>
                                    <Input type="number" value={formData.angsuran} onChange={e => setField('angsuran', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Tanda Jadi</Label>
                                    <Input type="number" value={formData.tandaJadi} onChange={e => setField('tandaJadi', e.target.value)} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Tenor</Label>
                                    <Input type="number" value={formData.tenor} onChange={e => setField('tenor', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Down Payment (DP)</Label>
                                    <Input type="number" value={formData.dp} onChange={e => setField('dp', e.target.value)} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Nama Leasing</Label>
                                <Input value={formData.namaLeasing} onChange={e => setField('namaLeasing', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Pembelian Via</Label>
                                <Input value={formData.pembelianVia} onChange={e => setField('pembelianVia', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Keterangan</Label>
                                <Textarea value={formData.keterangan} onChange={e => setField('keterangan', e.target.value)} />
                            </div>
                        </CardContent>
                        <CardFooter className="flex gap-2">
                            <Button variant="outline" className="flex-1" onClick={() => nextTab('unit')}>Back</Button>
                            <Button className="flex-1" onClick={() => nextTab('media')}>Next</Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                {/* TAB 4: MEDIA */}
                <TabsContent value="media">
                    <Card>
                        <CardHeader><CardTitle>D. Media Upload</CardTitle><CardDescription>Upload KTP, KK, and Selfie</CardDescription></CardHeader>
                        <CardContent className="space-y-6">
                            {/* KTP */}
                            <div className="space-y-2">
                                <Label>KTP Image {formData.ktpId && "✅"}</Label>
                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={() => setShowCamera({ isOpen: true, field: 'ktp' })}>Camera</Button>
                                    <Input type="file" className="hidden" id="ktp-upload" accept="image/*" onChange={e => handleMediaSelect(e, 'ktp')} />
                                    <Button variant="outline" onClick={() => document.getElementById('ktp-upload')?.click()}>Gallery</Button>
                                </div>
                                {formData.ktpUrl && <img src={formData.ktpUrl.startsWith('http') ? formData.ktpUrl : import.meta.env.VITE_STRAPI_BASE_URL?.replace('/api', '') + formData.ktpUrl} className="h-20 w-auto rounded border" />}
                            </div>

                            {/* KK */}
                            <div className="space-y-2">
                                <Label>KK Image {formData.kkId && "✅"}</Label>
                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={() => setShowCamera({ isOpen: true, field: 'kk' })}>Camera</Button>
                                    <Input type="file" className="hidden" id="kk-upload" accept="image/*" onChange={e => handleMediaSelect(e, 'kk')} />
                                    <Button variant="outline" onClick={() => document.getElementById('kk-upload')?.click()}>Gallery</Button>
                                </div>
                                {formData.kkUrl && <img src={formData.kkUrl.startsWith('http') ? formData.kkUrl : import.meta.env.VITE_STRAPI_BASE_URL?.replace('/api', '') + formData.kkUrl} className="h-20 w-auto rounded border" />}
                            </div>

                            {/* SELFIE */}
                            <div className="space-y-2">
                                <Label>Selfie with Customer {formData.selfieId && "✅"}</Label>
                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={() => setShowCamera({ isOpen: true, field: 'selfie' })}>Camera</Button>
                                    <Input type="file" className="hidden" id="selfie-upload" accept="image/*" onChange={e => handleMediaSelect(e, 'selfie')} />
                                    <Button variant="outline" onClick={() => document.getElementById('selfie-upload')?.click()}>Gallery</Button>
                                </div>
                                {formData.selfieUrl && <img src={formData.selfieUrl.startsWith('http') ? formData.selfieUrl : import.meta.env.VITE_STRAPI_BASE_URL?.replace('/api', '') + formData.selfieUrl} className="h-20 w-auto rounded border" />}
                            </div>
                        </CardContent>
                        <CardFooter className="flex gap-2">
                            <Button variant="outline" className="flex-1" onClick={() => nextTab('payment')}>Back</Button>
                            <Button className="flex-1" onClick={handleSubmit} disabled={loading || uploading}>
                                {loading ? 'Submitting...' : (editId ? 'Update SPK' : 'Create SPK')}
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Camera Modal */}
            {showCamera.isOpen && (
                <CameraCapture
                    onCapture={(file) => {
                        if (showCamera.field) uploadFileToStrapi(file, showCamera.field as any);
                    }}
                    onClose={() => setShowCamera({ isOpen: false, field: null })}
                />
            )}
        </div>
    );
}
