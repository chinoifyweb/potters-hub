"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Upload,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"

const steps = [
  { id: 1, title: "Details" },
  { id: 2, title: "Media" },
  { id: 3, title: "Categories" },
  { id: 4, title: "Review & Publish" },
]

const existingCategories = [
  "Faith",
  "Prayer",
  "Grace",
  "Community",
  "Teaching",
  "Hope",
  "Worship",
  "Family",
  "Evangelism",
  "Leadership",
]

export default function NewSermonPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    speaker: "",
    series: "",
    scripture: "",
    date: "",
    videoUrl: "",
    audioUrl: "",
    thumbnailUrl: "",
    categories: [] as string[],
    featured: false,
    published: false,
  })

  const updateField = (field: string, value: string | boolean | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const toggleCategory = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }))
  }

  const canProceed = () => {
    if (currentStep === 1) return formData.title && formData.speaker && formData.date
    if (currentStep === 2) return true
    if (currentStep === 3) return formData.categories.length > 0
    return true
  }

  const handleSubmit = () => {
    toast.success("Sermon created successfully!")
    router.push("/admin/sermons")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/admin/sermons")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Sermon</h1>
          <p className="text-muted-foreground">Add a new sermon to the church library</p>
        </div>
      </div>

      {/* Steps Indicator */}
      <div className="flex items-center gap-2">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors ${
                currentStep > step.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : currentStep === step.id
                  ? "border-primary text-primary"
                  : "border-muted text-muted-foreground"
              }`}
            >
              {currentStep > step.id ? <Check className="h-4 w-4" /> : step.id}
            </div>
            <span
              className={`hidden text-sm sm:inline ${
                currentStep >= step.id ? "text-foreground font-medium" : "text-muted-foreground"
              }`}
            >
              {step.title}
            </span>
            {index < steps.length - 1 && (
              <div
                className={`h-[2px] w-8 sm:w-16 ${
                  currentStep > step.id ? "bg-primary" : "bg-muted"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Details */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Sermon Details</CardTitle>
            <CardDescription>Enter the basic information for this sermon</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  placeholder="Enter sermon title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="speaker">Speaker *</Label>
                <Select value={formData.speaker} onValueChange={(v) => updateField("speaker", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select speaker" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pastor David">Pastor David</SelectItem>
                    <SelectItem value="Pastor Sarah">Pastor Sarah</SelectItem>
                    <SelectItem value="Elder Michael">Elder Michael</SelectItem>
                    <SelectItem value="Elder Ruth">Elder Ruth</SelectItem>
                    <SelectItem value="Music Pastor John">Music Pastor John</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="Enter sermon description"
                rows={4}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="series">Series</Label>
                <Input
                  id="series"
                  value={formData.series}
                  onChange={(e) => updateField("series", e.target.value)}
                  placeholder="e.g., Faith Series"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scripture">Scripture Reference</Label>
                <Input
                  id="scripture"
                  value={formData.scripture}
                  onChange={(e) => updateField("scripture", e.target.value)}
                  placeholder="e.g., John 3:16"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => updateField("date", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Media */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Media Files</CardTitle>
            <CardDescription>Upload or provide URLs for sermon media</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="videoUrl">Video URL</Label>
              <Input
                id="videoUrl"
                value={formData.videoUrl}
                onChange={(e) => updateField("videoUrl", e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
              />
              <p className="text-xs text-muted-foreground">YouTube, Vimeo, or direct video URL</p>
            </div>
            <div className="space-y-2">
              <Label>Audio File</Label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent/50 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload audio file
                    </p>
                    <p className="text-xs text-muted-foreground">MP3, WAV, or M4A</p>
                  </div>
                  <input type="file" className="hidden" accept="audio/*" />
                </label>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Thumbnail Image</Label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent/50 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload thumbnail
                    </p>
                    <p className="text-xs text-muted-foreground">PNG, JPG, or WebP (recommended 1280x720)</p>
                  </div>
                  <input type="file" className="hidden" accept="image/*" />
                </label>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Categories */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Categories</CardTitle>
            <CardDescription>Select one or more categories for this sermon</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {existingCategories.map((category) => {
                const isSelected = formData.categories.includes(category)
                return (
                  <Badge
                    key={category}
                    variant={isSelected ? "default" : "outline"}
                    className="cursor-pointer text-sm px-3 py-1.5"
                    onClick={() => toggleCategory(category)}
                  >
                    {isSelected && <Check className="mr-1 h-3 w-3" />}
                    {category}
                  </Badge>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Review */}
      {currentStep === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Review & Publish</CardTitle>
            <CardDescription>Review the sermon details before publishing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Title</p>
                <p className="font-medium">{formData.title || "Not set"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Speaker</p>
                <p>{formData.speaker || "Not set"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Date</p>
                <p>{formData.date ? new Date(formData.date).toLocaleDateString() : "Not set"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Series</p>
                <p>{formData.series || "None"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Scripture</p>
                <p>{formData.scripture || "None"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Categories</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {formData.categories.length > 0
                    ? formData.categories.map((c) => (
                        <Badge key={c} variant="outline" className="text-xs">{c}</Badge>
                      ))
                    : <span>None selected</span>}
                </div>
              </div>
            </div>
            {formData.description && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Description</p>
                <p className="text-sm mt-1">{formData.description}</p>
              </div>
            )}
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="font-medium">Feature this sermon</p>
                <p className="text-sm text-muted-foreground">Display on the homepage featured section</p>
              </div>
              <Switch
                checked={formData.featured}
                onCheckedChange={(v) => updateField("featured", v)}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="font-medium">Publish immediately</p>
                <p className="text-sm text-muted-foreground">Make this sermon visible to all members</p>
              </div>
              <Switch
                checked={formData.published}
                onCheckedChange={(v) => updateField("published", v)}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(currentStep - 1)}
          disabled={currentStep <= 1}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        {currentStep < 4 ? (
          <Button
            onClick={() => setCurrentStep(currentStep + 1)}
            disabled={!canProceed()}
          >
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit}>
            <Check className="mr-2 h-4 w-4" />
            Create Sermon
          </Button>
        )}
      </div>
    </div>
  )
}
