import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { collection, getDocs, setDoc, doc, serverTimestamp, deleteDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Template } from '@/types/interfaces';
import { v4 as uuidv4 } from 'uuid';

export type TemplateCard = {
    id: string;
    templateName: string;
    objective: string;
    funnelStage: 'TOFU' | 'MOFU' | 'BOFU';
    contentType: string;
    scope: string;
    usageCount: number;
    tags: string[];
    createdAt: { seconds: number; nanoseconds: number };
};

export type CreateTemplateData = {
    templateName: string;
    templateContent: string;
    objective: string;
    funnelStage: 'TOFU' | 'MOFU' | 'BOFU';
    contentType: string;
    scope: string;
    tags: string[];
    examplePlaceholders: Record<string, string>;
};

export type UpdateTemplateData = Partial<CreateTemplateData> & {
    id: string;
};

type TemplatesContextType = {
    templates: TemplateCard[];
    loading: boolean;
    error: string | null;
    fetchTemplates: () => Promise<void>;
    addTemplate: (template: CreateTemplateData) => Promise<string | null>;
    updateTemplate: (template: UpdateTemplateData) => Promise<void>;
    deleteTemplate: (id: string) => Promise<void>;
    getTemplateDetails: (templateId: string) => Promise<Template | null>;
    templateDetails: Template | null;
    templateDetailsLoading: boolean;
    templateDetailsError: string | null;
    incrementUsageCount: (templateId: string) => Promise<void>;
    getTemplatesByTag: (tag: string) => TemplateCard[];
    getTemplatesByFunnelStage: (stage: 'TOFU' | 'MOFU' | 'BOFU') => TemplateCard[];
    getTemplatesByObjective: (objective: string) => TemplateCard[];
};

const TemplatesContext = createContext<TemplatesContextType>({
    templates: [],
    loading: false,
    error: null,
    fetchTemplates: async () => { },
    addTemplate: async () => null,
    updateTemplate: async () => { },
    deleteTemplate: async () => { },
    getTemplateDetails: async () => null,
    templateDetails: null,
    templateDetailsLoading: false,
    templateDetailsError: null,
    incrementUsageCount: async () => { },
    getTemplatesByTag: () => [],
    getTemplatesByFunnelStage: () => [],
    getTemplatesByObjective: () => [],
});

export const useTemplates = () => useContext(TemplatesContext);

export const TemplatesProvider = ({ children }: { children: ReactNode }) => {
    const [templates, setTemplates] = useState<TemplateCard[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [templateDetails, setTemplateDetails] = useState<Template | null>(null);
    const [templateDetailsLoading, setTemplateDetailsLoading] = useState(false);
    const [templateDetailsError, setTemplateDetailsError] = useState<string | null>(null);

    const fetchTemplates = async () => {
        setLoading(true);
        setError(null);
        try {
            const templatesCol = collection(db, 'agencies', 'agency1', 'templates');
            const snapshot = await getDocs(templatesCol);

            const templatesList: TemplateCard[] = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    templateName: data.templateName || '',
                    objective: data.objective || '',
                    funnelStage: data.funnelStage || 'TOFU',
                    contentType: data.contentType || '',
                    scope: data.scope || '',
                    usageCount: data.usageCount || 0,
                    tags: data.tags || [],
                    createdAt: data.createdAt || { seconds: 0, nanoseconds: 0 },
                };
            });
            setTemplates(templatesList);
            setLoading(false);
        } catch (err: any) {
            console.error('[TemplatesContext] Error fetching templates:', err);
            setError(err.message || 'Failed to fetch templates');
            setTemplates([]);
        }
        setLoading(false);
    };

    const addTemplate = async (templateData: CreateTemplateData): Promise<string | null> => {
        try {
            const templateId = uuidv4(); // Use UUID v4 for the template ID
            const templateDocRef = doc(db, 'agencies', 'agency1', 'templates', templateId);

            const newTemplate = {
                ...templateData,
                agencyId: 'agency1',
                usageCount: 0,
                createdAt: serverTimestamp(),
            };

            await setDoc(templateDocRef, newTemplate);

            // Update local state
            await fetchTemplates();

            return templateId;
        } catch (err: any) {
            console.error('[TemplatesContext] Error adding template:', err);
            setError(err.message || 'Failed to add template');
            return null;
        }
    };

    const updateTemplate = async (templateData: UpdateTemplateData) => {
        try {
            const { id, ...updateData } = templateData;
            const templateDocRef = doc(db, 'agencies', 'agency1', 'templates', id);

            await updateDoc(templateDocRef, {
                ...updateData,
                updatedAt: serverTimestamp(),
            });

            // Update local state
            await fetchTemplates();

            // Update template details if it's the same template
            if (templateDetails && templateDetails.id === id) {
                await getTemplateDetails(id);
            }
        } catch (err: any) {
            console.error('[TemplatesContext] Error updating template:', err);
            setError(err.message || 'Failed to update template');
        }
    };

    const deleteTemplate = async (id: string) => {
        try {
            const templateDocRef = doc(db, 'agencies', 'agency1', 'templates', id);
            await deleteDoc(templateDocRef);

            // Remove the template from local state without refetching
            setTemplates(prev => prev.filter(template => template.id !== id));

            // Clear template details if it's the same template
            if (templateDetails && templateDetails.id === id) {
                setTemplateDetails(null);
            }
        } catch (err: any) {
            console.error('[TemplatesContext] Error deleting template:', err);
            setError(err.message || 'Failed to delete template');
        }
    };

    const getTemplateDetails = useCallback(async (templateId: string): Promise<Template | null> => {
        setTemplateDetailsLoading(true);
        setTemplateDetailsError(null);
        try {
            const templateDocRef = doc(db, 'agencies', 'agency1', 'templates', templateId);
            const templateSnap = await getDoc(templateDocRef);

            if (!templateSnap.exists()) {
                setTemplateDetails(null);
                setTemplateDetailsLoading(false);
                return null;
            }

            const data = templateSnap.data();

            const details: Template = {
                id: templateId,
                templateName: data.templateName || '',
                templateContent: data.templateContent || '',
                objective: data.objective || '',
                funnelStage: data.funnelStage || 'TOFU',
                contentType: data.contentType || '',
                scope: data.scope || '',
                agencyId: data.agencyId || 'agency1',
                createdAt: data.createdAt || { seconds: 0, nanoseconds: 0 },
                usageCount: data.usageCount || 0,
                examplePlaceholders: data.examplePlaceholders || {},
                tags: data.tags || [],
            };

            setTemplateDetails(details);
            setTemplateDetailsLoading(false);
            return details;
        } catch (err: any) {
            setTemplateDetailsError(err.message || 'Failed to fetch template details');
            setTemplateDetails(null);
            setTemplateDetailsLoading(false);
            console.error('[TemplatesContext] Error fetching template details:', err);
            return null;
        }
    }, []);

    const incrementUsageCount = async (templateId: string) => {
        try {
            const templateDocRef = doc(db, 'agencies', 'agency1', 'templates', templateId);
            const templateSnap = await getDoc(templateDocRef);

            if (templateSnap.exists()) {
                const currentUsageCount = templateSnap.data().usageCount || 0;
                await updateDoc(templateDocRef, {
                    usageCount: currentUsageCount + 1,
                    lastUsedAt: serverTimestamp(),
                });

                // Update local state
                setTemplates(prev => prev.map(template =>
                    template.id === templateId
                        ? { ...template, usageCount: currentUsageCount + 1 }
                        : template
                ));

                // Update template details if it's the same template
                if (templateDetails && templateDetails.id === templateId) {
                    setTemplateDetails(prev => prev ? { ...prev, usageCount: currentUsageCount + 1 } : null);
                }
            }
        } catch (err: any) {
            console.error('[TemplatesContext] Error incrementing usage count:', err);
        }
    };

    // Utility functions for filtering templates
    const getTemplatesByTag = (tag: string): TemplateCard[] => {
        return templates.filter(template =>
            template.tags.some(templateTag =>
                templateTag.toLowerCase().includes(tag.toLowerCase())
            )
        );
    };

    const getTemplatesByFunnelStage = (stage: 'TOFU' | 'MOFU' | 'BOFU'): TemplateCard[] => {
        return templates.filter(template => template.funnelStage === stage);
    };

    const getTemplatesByObjective = (objective: string): TemplateCard[] => {
        return templates.filter(template =>
            template.objective.toLowerCase().includes(objective.toLowerCase())
        );
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    return (
        <TemplatesContext.Provider value={{
            templates,
            loading,
            error,
            fetchTemplates,
            addTemplate,
            updateTemplate,
            deleteTemplate,
            getTemplateDetails,
            templateDetails,
            templateDetailsLoading,
            templateDetailsError,
            incrementUsageCount,
            getTemplatesByTag,
            getTemplatesByFunnelStage,
            getTemplatesByObjective,
        }}>
            {children}
        </TemplatesContext.Provider>
    );
};