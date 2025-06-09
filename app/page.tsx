import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Brain,
  FileIcon as FileTransfer,
  Database,
  ArrowRight,
  Zap,
  Shield,
  FolderOpen,
  FileText,
  BarChart3,
  TrendingUp,
} from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section */}
      <section className="py-12 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Intelligent Data Mapping & Transformation
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Revolutionize your data integration workflows with AI-powered mapping, automated transformation, and
              centralized file management.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button asChild size="lg" className="bg-blue-900 hover:bg-blue-800">
              <Link href="/data-mapping">
                <Brain className="mr-2 h-5 w-5" />
                Start AI Mapping
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/dashboard">
                <BarChart3 className="mr-2 h-5 w-5" />
                View Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-12 px-6 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">Comprehensive Data Platform</h2>
            <p className="text-lg text-slate-600">Everything you need for modern data integration</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Dashboard */}
            <Card className="border-2 hover:border-blue-200 transition-all duration-200 hover:shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-blue-900" />
                  </div>
                  <CardTitle className="text-lg">Conversion Dashboard</CardTitle>
                </div>
                <CardDescription>
                  Monitor all conversion runs with detailed analytics and error tracking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-600 mb-4">
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-blue-600" />
                    Real-time conversion monitoring
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-blue-600" />
                    Detailed error logs and debugging
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-blue-600" />
                    Performance metrics and analytics
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-blue-600" />
                    File processing history
                  </li>
                </ul>
                <Button asChild className="w-full">
                  <Link href="/dashboard">View Dashboard</Link>
                </Button>
              </CardContent>
            </Card>

            {/* AI Mapping */}
            <Card className="border-2 hover:border-blue-200 transition-all duration-200 hover:shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Brain className="h-6 w-6 text-green-700" />
                  </div>
                  <CardTitle className="text-lg">AI-Powered Mapping</CardTitle>
                </div>
                <CardDescription>Intelligent field mapping with confidence scoring and validation</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-600 mb-4">
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-green-600" />
                    Smart document analysis
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-green-600" />
                    Confidence-based suggestions
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-green-600" />
                    Multiple format support
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-green-600" />
                    Project-based configurations
                  </li>
                </ul>
                <Button asChild className="w-full" variant="outline">
                  <Link href="/data-mapping">Start Mapping</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Data Transformation */}
            <Card className="border-2 hover:border-blue-200 transition-all duration-200 hover:shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <FileTransfer className="h-6 w-6 text-purple-700" />
                  </div>
                  <CardTitle className="text-lg">Data Transformation</CardTitle>
                </div>
                <CardDescription>Automated transformation with real-time progress tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-600 mb-4">
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-purple-600" />
                    Batch processing capabilities
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-purple-600" />
                    Real-time progress monitoring
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-purple-600" />
                    Error handling and validation
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-purple-600" />
                    Multiple input sources
                  </li>
                </ul>
                <Button asChild className="w-full" variant="outline">
                  <Link href="/transform">Transform Data</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Data Contracts */}
            <Card className="border-2 hover:border-blue-200 transition-all duration-200 hover:shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <FileText className="h-6 w-6 text-indigo-700" />
                  </div>
                  <CardTitle className="text-lg">Data Contracts</CardTitle>
                </div>
                <CardDescription>Automated contract generation with governance features</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-600 mb-4">
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-indigo-600" />
                    Automated generation from samples
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-indigo-600" />
                    Business metadata management
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-indigo-600" />
                    Quality validation rules
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-indigo-600" />
                    Version control and compliance
                  </li>
                </ul>
                <Button asChild className="w-full" variant="outline">
                  <Link href="/contracts">Manage Contracts</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Projects */}
            <Card className="border-2 hover:border-blue-200 transition-all duration-200 hover:shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <FolderOpen className="h-6 w-6 text-orange-700" />
                  </div>
                  <CardTitle className="text-lg">Project Management</CardTitle>
                </div>
                <CardDescription>Organize configurations and collaborate across teams</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-600 mb-4">
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-orange-600" />
                    Reusable configurations
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-orange-600" />
                    Team collaboration
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-orange-600" />
                    Version control
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-orange-600" />
                    Access management
                  </li>
                </ul>
                <Button asChild className="w-full" variant="outline">
                  <Link href="/projects">View Projects</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Data Queue */}
            <Card className="border-2 hover:border-blue-200 transition-all duration-200 hover:shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-teal-100 rounded-lg">
                    <Database className="h-6 w-6 text-teal-700" />
                  </div>
                  <CardTitle className="text-lg">Data Queue</CardTitle>
                </div>
                <CardDescription>Centralized file management with metadata tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-600 mb-4">
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-teal-600" />
                    File upload and organization
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-teal-600" />
                    Advanced search and filtering
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-teal-600" />
                    Status tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-teal-600" />
                    Integration workflows
                  </li>
                </ul>
                <Button asChild className="w-full" variant="outline">
                  <Link href="/ldq">Manage Queue</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 px-6 bg-slate-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">Why Choose EPI-USE Data Platform?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="p-3 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Zap className="h-8 w-8 text-blue-900" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Lightning Fast</h3>
              <p className="text-slate-600">Reduce manual mapping time by 70-80% with AI automation</p>
            </div>

            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="p-3 bg-green-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Shield className="h-8 w-8 text-green-700" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Enterprise Security</h3>
              <p className="text-slate-600">Bank-grade security with encryption and audit trails</p>
            </div>

            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="p-3 bg-purple-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <TrendingUp className="h-8 w-8 text-purple-700" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Complete Visibility</h3>
              <p className="text-slate-600">Full monitoring and analytics for all data operations</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
