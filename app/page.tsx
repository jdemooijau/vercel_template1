import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Brain, FileIcon as FileTransfer, Database, ArrowRight, Upload, Zap, Shield } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <div className="mb-8">
            <h1 className="text-5xl font-bold text-slate-900 mb-6">Intelligent Data Mapping & Transformation</h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Revolutionize your data integration workflows with AI-powered mapping, automated transformation, and
              centralized file management.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button asChild size="lg" className="bg-blue-900 hover:bg-blue-800">
              <Link href="/data-mapping">
                <Brain className="mr-2 h-5 w-5" />
                Start AI Mapping
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/transform">
                <FileTransfer className="mr-2 h-5 w-5" />
                Transform Data
              </Link>
            </Button>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-900 mb-2">70-80%</div>
              <div className="text-slate-600">Reduction in mapping time</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-900 mb-2">99.8%</div>
              <div className="text-slate-600">Transformation accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-900 mb-2">1000+</div>
              <div className="text-slate-600">Files processed hourly</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Powerful Features for Data Integration</h2>
            <p className="text-lg text-slate-600">Everything you need to streamline your data workflows</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* AI-Powered Mapping */}
            <Card className="border-2 hover:border-blue-200 transition-colors">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Brain className="h-6 w-6 text-blue-900" />
                  </div>
                  <CardTitle className="text-xl">AI-Powered Mapping</CardTitle>
                </div>
                <CardDescription>
                  Intelligent analysis of source and target documents with confidence scoring
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-600 mb-4">
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-blue-600" />
                    Document upload and parsing (PDF, DOC, DOCX, TXT)
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-blue-600" />
                    AI-driven field analysis and mapping suggestions
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-blue-600" />
                    Confidence scoring for each mapping suggestion
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-blue-600" />
                    Project-based configuration storage
                  </li>
                </ul>
                <Button asChild className="w-full">
                  <Link href="/data-mapping">Start Mapping</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Data Transformation */}
            <Card className="border-2 hover:border-blue-200 transition-colors">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <FileTransfer className="h-6 w-6 text-green-700" />
                  </div>
                  <CardTitle className="text-xl">Data Transformation</CardTitle>
                </div>
                <CardDescription>Automated data transformation using saved mapping configurations</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-600 mb-4">
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-green-600" />
                    Project selection from saved configurations
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-green-600" />
                    Multiple input methods (upload, LDQ selection)
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-green-600" />
                    Real-time transformation progress tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-green-600" />
                    Comprehensive error reporting and validation
                  </li>
                </ul>
                <Button asChild className="w-full" variant="outline">
                  <Link href="/transform">Transform Data</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Local Data Queue */}
            <Card className="border-2 hover:border-blue-200 transition-colors">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Database className="h-6 w-6 text-purple-700" />
                  </div>
                  <CardTitle className="text-xl">Data Queue (DQ)</CardTitle>
                </div>
                <CardDescription>Centralized file management with comprehensive metadata tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-600 mb-4">
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-purple-600" />
                    File upload with metadata assignment
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-purple-600" />
                    Advanced filtering and search capabilities
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-purple-600" />
                    Status tracking and processing monitoring
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-purple-600" />
                    Integration with transformation workflows
                  </li>
                </ul>
                <Button asChild className="w-full" variant="outline">
                  <Link href="/ldq">Manage Queue</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Projects */}
            <Card className="border-2 hover:border-blue-200 transition-colors">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Upload className="h-6 w-6 text-orange-700" />
                  </div>
                  <CardTitle className="text-xl">Project Management</CardTitle>
                </div>
                <CardDescription>Organize and reuse mapping configurations across projects</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-600 mb-4">
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-orange-600" />
                    Reusable mapping configurations
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-orange-600" />
                    Project-based organization
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-orange-600" />
                    Version control and history
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-orange-600" />
                    Team collaboration features
                  </li>
                </ul>
                <Button asChild className="w-full" variant="outline">
                  <Link href="/projects">View Projects</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 bg-slate-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Why Choose EPI-USE Data Platform?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="p-4 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Zap className="h-8 w-8 text-blue-900" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Lightning Fast</h3>
              <p className="text-slate-600">Reduce manual mapping time by 70-80% with AI-powered automation</p>
            </div>

            <div className="text-center">
              <div className="p-4 bg-green-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Shield className="h-8 w-8 text-green-700" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Enterprise Security</h3>
              <p className="text-slate-600">Bank-grade security with encryption, audit trails, and compliance</p>
            </div>

            <div className="text-center">
              <div className="p-4 bg-purple-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Brain className="h-8 w-8 text-purple-700" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">AI-Powered</h3>
              <p className="text-slate-600">Advanced machine learning for intelligent field mapping and validation</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
