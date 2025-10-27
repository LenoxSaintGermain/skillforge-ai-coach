import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, FileText, Code, Database, Cloud, Shield, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeMermaid from 'rehype-mermaid';

// Import markdown files as raw text
const PRODUCTION_ARCHITECTURE = `${window.location.origin}/docs/PRODUCTION_ARCHITECTURE.md`;
const DEPLOYMENT_CHECKLIST = `${window.location.origin}/docs/DEPLOYMENT_CHECKLIST.md`;
const OPERATIONS_RUNBOOK = `${window.location.origin}/docs/OPERATIONS_RUNBOOK.md`;
const INFRASTRUCTURE_SETUP = `${window.location.origin}/docs/INFRASTRUCTURE_SETUP.md`;

const documents = [
  {
    id: 'architecture',
    title: 'Production Architecture',
    description: 'Complete GCP architecture with Mermaid diagrams, component specifications, and scaling strategy',
    icon: Cloud,
    file: 'PRODUCTION_ARCHITECTURE.md',
    downloadPath: '/docs/PRODUCTION_ARCHITECTURE.md',
    color: 'text-blue-500'
  },
  {
    id: 'checklist',
    title: 'Deployment Checklist',
    description: '50+ step deployment guide covering pre-deployment, migration, containerization, and go-live',
    icon: FileText,
    file: 'DEPLOYMENT_CHECKLIST.md',
    downloadPath: '/docs/DEPLOYMENT_CHECKLIST.md',
    color: 'text-green-500'
  },
  {
    id: 'runbook',
    title: 'Operations Runbook',
    description: 'Single-page quick reference for production operations, deployments, and incident response',
    icon: Code,
    file: 'OPERATIONS_RUNBOOK.md',
    downloadPath: '/docs/OPERATIONS_RUNBOOK.md',
    color: 'text-purple-500'
  },
  {
    id: 'infrastructure',
    title: 'Infrastructure Setup',
    description: 'Complete Terraform IaC and gcloud CLI commands for automated infrastructure provisioning',
    icon: Database,
    file: 'INFRASTRUCTURE_SETUP.md',
    downloadPath: '/docs/INFRASTRUCTURE_SETUP.md',
    color: 'text-orange-500'
  }
];

const ProductionDocumentation = () => {
  const [activeDoc, setActiveDoc] = useState('architecture');
  const [markdownContent, setMarkdownContent] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const downloadDocument = async (doc: typeof documents[0]) => {
    try {
      // Fetch from public folder
      const response = await fetch(doc.downloadPath);
      if (!response.ok) throw new Error('Failed to fetch document');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.file;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success(`Downloaded ${doc.file}`);
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download document');
    }
  };

  const downloadAllDocuments = async () => {
    toast.info('Downloading all documents...');
    for (const doc of documents) {
      await downloadDocument(doc);
      // Small delay between downloads
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    toast.success('All documents downloaded');
  };

  const previewDocument = async (doc: typeof documents[0]) => {
    setLoading(true);
    try {
      const response = await fetch(doc.downloadPath);
      if (!response.ok) throw new Error('Failed to fetch document');
      
      const text = await response.text();
      setMarkdownContent(text);
      setActiveDoc(doc.id);
    } catch (error) {
      console.error('Preview error:', error);
      toast.error('Failed to load document preview');
      setMarkdownContent('# Error\n\nFailed to load document preview.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">Production Deployment Documentation</h1>
          <p className="text-muted-foreground">
            Complete enterprise deployment plan for migrating AI SkillForge to Google Cloud Platform
          </p>
        </div>
        <Button onClick={downloadAllDocuments} size="lg">
          <Download className="mr-2 h-4 w-4" />
          Download All Documents
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {documents.map((doc) => {
          const Icon = doc.icon;
          return (
            <Card key={doc.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <Icon className={`h-8 w-8 ${doc.color}`} />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => downloadDocument(doc)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
                <CardTitle className="text-lg">{doc.title}</CardTitle>
                <CardDescription className="text-sm">{doc.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => previewDocument(doc)}
                >
                  View Document
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Document Preview</CardTitle>
          <CardDescription>
            Preview documentation content (download for best viewing experience)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : markdownContent ? (
            <div className="prose prose-sm max-w-none dark:prose-invert overflow-auto max-h-[600px] p-4">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[[rehypeMermaid, { strategy: 'inline-svg' }]]}
                components={{
                  pre: ({ node, ...props }) => (
                    <pre className="overflow-auto bg-muted p-4 rounded-lg" {...props} />
                  ),
                  code: ({ node, className, children, ...props }) => {
                    const isInline = !className?.includes('language-');
                    return (
                      <code
                        className={isInline ? 'bg-muted px-1 py-0.5 rounded text-sm' : 'text-sm'}
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {markdownContent}
              </ReactMarkdown>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Select a document to preview</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Enterprise Architecture Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">🏗️ Infrastructure</h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Cloud Run for frontend</li>
                <li>• Cloud Functions for backend</li>
                <li>• Cloud SQL PostgreSQL</li>
                <li>• Cloud Storage buckets</li>
                <li>• VPC with private networking</li>
              </ul>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">🤖 AI Services</h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Vertex AI integration</li>
                <li>• Gemini 2.5 models</li>
                <li>• Cloud-native scaling</li>
                <li>• Cost optimization</li>
                <li>• Response caching</li>
              </ul>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">🔒 Security</h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Cloud Armor WAF</li>
                <li>• Secret Manager</li>
                <li>• IAM roles & policies</li>
                <li>• SSL/TLS encryption</li>
                <li>• Audit logging</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Estimated Monthly Cost
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Cloud Run</p>
                <p className="font-semibold">$30-80</p>
              </div>
              <div>
                <p className="text-muted-foreground">Cloud SQL</p>
                <p className="font-semibold">$50-150</p>
              </div>
              <div>
                <p className="text-muted-foreground">Vertex AI</p>
                <p className="font-semibold">$20-100</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total Estimate</p>
                <p className="font-semibold text-lg">$115-380</p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
            <h3 className="font-semibold mb-2">📋 Migration Timeline</h3>
            <ul className="text-sm space-y-1">
              <li>• <strong>Week 1:</strong> Infrastructure setup and provisioning</li>
              <li>• <strong>Week 2:</strong> Database schema and data migration</li>
              <li>• <strong>Week 3:</strong> Application containerization and deployment</li>
              <li>• <strong>Week 4:</strong> Parallel run and gradual traffic shift</li>
              <li>• <strong>Week 5:</strong> Complete cutover and Supabase decommission</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Download all documentation files using the button above</li>
            <li>Review the Production Architecture document with your enterprise architects</li>
            <li>Follow the Deployment Checklist for step-by-step migration</li>
            <li>Use the Infrastructure Setup guide for Terraform-based provisioning</li>
            <li>Keep the Operations Runbook handy for day-to-day operations</li>
            <li>Schedule a migration planning meeting with stakeholders</li>
            <li>Request GCP project creation and quota increases</li>
            <li>Begin Phase 1: Infrastructure Setup</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductionDocumentation;
