import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from "@/stores/authStore";
import { api } from '@/lib/axios';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Edit, Printer } from "lucide-react";

export default function SpkPage() {
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    const [salesUid, setSalesUid] = useState<string | null>(null);
    const [spkList, setSpkList] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("on_progress"); // on_progress | finish

    // 1. Fetch Sales UID first
    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) return;
            try {
                const res = await api.get('/sales-profiles', {
                    params: { filters: { email: { $eq: user.email } } }
                });
                if (res.data?.data?.length > 0) {
                    setSalesUid(res.data.data[0].sales_uid);
                }
            } catch (err) {
                console.error("Failed to fetch profile", err);
            }
        };
        fetchProfile();
    }, [user]);

    // 2. Fetch SPKs based on Tab & Sales UID
    useEffect(() => {
        const fetchSpks = async () => {
            if (!salesUid) return;

            setLoading(true);
            try {
                // Common filters
                const filters: any = {
                    salesProfile: {
                        sales_uid: { $eq: salesUid }
                    }
                };

                if (activeTab === 'on_progress') {
                    filters.finish = { $eq: false };
                    filters.editable = { $eq: true };
                } else if (activeTab === 'finish') {
                    filters.finish = { $eq: true };
                    // editable can be true or false, so we don't filter it
                }

                const res = await api.get('/spks', {
                    params: {
                        filters,
                        populate: ['vehicleType'], // Need vehicle name
                        sort: ['createdAt:desc']
                    }
                });

                setSpkList(res.data?.data || []);
            } catch (err) {
                console.error("Failed to fetch SPKs", err);
            } finally {
                setLoading(false);
            }
        };

        fetchSpks();
    }, [salesUid, activeTab]);

    const handleEdit = (spk: any) => {
        const spkId = spk.documentId || spk.id;
        navigate(`/spk/edit/${spkId}`);
    };

    return (
        <div className="container mx-auto p-4 pb-20">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">SPK Dashboard</h1>
                    <p className="text-slate-500 text-sm">Manage your vehicle orders</p>
                </div>
                <Button onClick={() => navigate('/spk/create')}>
                    <PlusCircle className="mr-2 h-4 w-4" /> New SPK
                </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="on_progress">On Progress</TabsTrigger>
                    <TabsTrigger value="finish">Finish</TabsTrigger>
                </TabsList>

                <TabsContent value="on_progress">
                    <SpkTable data={spkList} loading={loading} onEdit={handleEdit} tab="on_progress" />
                </TabsContent>

                <TabsContent value="finish">
                    <SpkTable data={spkList} loading={loading} onEdit={handleEdit} tab="finish" />
                </TabsContent>
            </Tabs>
        </div>
    );
}

function SpkTable({ data, loading, onEdit, tab }: any) {
    if (loading) return <div className="p-8 text-center text-slate-500">Loading data...</div>;
    if (data.length === 0) return <div className="p-8 text-center text-slate-500 border rounded-lg bg-slate-50">No SPKs found.</div>;

    return (
        <Card>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>No SPK</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Vehicle</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((spk: any) => (
                                <TableRow key={spk.id}>
                                    <TableCell className="font-medium">{spk.noSPK}</TableCell>
                                    <TableCell>
                                        <div className="font-medium">{spk.namaCustomer}</div>
                                        <div className="text-xs text-slate-500">{spk.noTeleponCustomer}</div>
                                    </TableCell>
                                    <TableCell>{spk.unitInfo?.vehicleType?.name || spk.vehicleType?.name || '-'}</TableCell>
                                    <TableCell>{spk.tanggal}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            {/* Edit Action: Only if tab is progress (double check logic) or if editable is true */}
                                            {/* User said: "Edit" only with condition finish = False and editable = True. */
                                                (spk.finish === false && spk.editable === true) && (
                                                    <Button size="sm" variant="outline" onClick={() => onEdit(spk)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                )}

                                            <Button size="sm" variant="ghost" disabled>
                                                <Printer className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
