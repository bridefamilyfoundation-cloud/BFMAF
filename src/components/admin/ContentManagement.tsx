import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, MessageSquare, Award, FileText, ListOrdered, HelpCircle, Camera } from "lucide-react";
import TeamMembersManager from "./TeamMembersManager";
import FAQsManager from "./FAQsManager";
import ValuesManager from "./ValuesManager";
import PageSectionsEditor from "./PageSectionsEditor";
import ProcessStepsManager from "./ProcessStepsManager";
import HowWeHelpManager from "./HowWeHelpManager";
import SubmissionRequirementsManager from "./SubmissionRequirementsManager";

const ContentManagement = () => {
    const [activeTab, setActiveTab] = useState("team");

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-serif font-bold text-foreground mb-2">
                    Content Management
                </h2>
                <p className="text-muted-foreground">
                    Manage all website content from one place. Changes appear immediately on the live site.
                </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-4 lg:grid-cols-7 gap-2 h-auto p-2 bg-secondary/30">
                    <TabsTrigger value="team" className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span className="hidden sm:inline">Team</span>
                    </TabsTrigger>
                    <TabsTrigger value="faqs" className="flex items-center gap-2">
                        <HelpCircle className="w-4 h-4" />
                        <span className="hidden sm:inline">FAQs</span>
                    </TabsTrigger>
                    <TabsTrigger value="values" className="flex items-center gap-2">
                        <Award className="w-4 h-4" />
                        <span className="hidden sm:inline">Values</span>
                    </TabsTrigger>
                    <TabsTrigger value="pages" className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        <span className="hidden sm:inline">Pages</span>
                    </TabsTrigger>
                    <TabsTrigger value="steps" className="flex items-center gap-2">
                        <ListOrdered className="w-4 h-4" />
                        <span className="hidden sm:inline">Steps</span>
                    </TabsTrigger>
                    <TabsTrigger value="help" className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        <span className="hidden sm:inline">Help</span>
                    </TabsTrigger>
                    <TabsTrigger value="requirements" className="flex items-center gap-2">
                        <Camera className="w-4 h-4" />
                        <span className="hidden sm:inline">Requirements</span>
                    </TabsTrigger>
                </TabsList>

                <div className="mt-6">
                    <TabsContent value="team" className="mt-0">
                        <TeamMembersManager />
                    </TabsContent>

                    <TabsContent value="faqs" className="mt-0">
                        <FAQsManager />
                    </TabsContent>

                    <TabsContent value="values" className="mt-0">
                        <ValuesManager />
                    </TabsContent>

                    <TabsContent value="pages" className="mt-0">
                        <PageSectionsEditor />
                    </TabsContent>

                    <TabsContent value="steps" className="mt-0">
                        <ProcessStepsManager />
                    </TabsContent>

                    <TabsContent value="help" className="mt-0">
                        <HowWeHelpManager />
                    </TabsContent>

                    <TabsContent value="requirements" className="mt-0">
                        <SubmissionRequirementsManager />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
};

export default ContentManagement;
