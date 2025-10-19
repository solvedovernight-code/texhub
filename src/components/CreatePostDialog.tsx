import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Image, 
  BarChart3, 
  Upload, 
  Plus, 
  Minus, 
  Eye, 
  EyeOff,
  Thermometer,
  Clock,
  MapPin
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Post, PostAttachment, ChartData, POST_TYPES } from '../types/social';
import * as Select from '@radix-ui/react-select';

interface CreatePostDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatePost: (post: Omit<Post, 'id' | 'timestamp' | 'likes' | 'comments' | 'views' | 'bookmarks' | 'shares' | 'isLiked' | 'isBookmarked' | 'replies'>) => void;
  userProfile: any;
}

export const CreatePostDialog: React.FC<CreatePostDialogProps> = ({
  isOpen,
  onClose,
  onCreatePost,
  userProfile
}) => {
  const [postData, setPostData] = useState({
    content: '',
    type: 'general' as Post['type'],
    tags: '',
    isAnonymous: false,
    location: '',
    temperature: '',
    dyeingMethod: '',
    fabricType: ''
  });

  const [attachments, setAttachments] = useState<PostAttachment[]>([]);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [showChartBuilder, setShowChartBuilder] = useState(false);
  const [chartBuilder, setChartBuilder] = useState({
    type: 'line' as ChartData['type'],
    title: '',
    description: '',
    xAxis: 'Time',
    yAxis: 'Temperature',
    dataPoints: [{ x: '', y: '' }]
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const attachment: PostAttachment = {
        id: Date.now().toString() + Math.random(),
        type: file.type.startsWith('image/') ? 'image' : 'document',
        url: URL.createObjectURL(file),
        name: file.name,
        size: file.size
      };
      setAttachments(prev => [...prev, attachment]);
    });
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(att => att.id !== id));
  };

  const addDataPoint = () => {
    setChartBuilder(prev => ({
      ...prev,
      dataPoints: [...prev.dataPoints, { x: '', y: '' }]
    }));
  };

  const removeDataPoint = (index: number) => {
    setChartBuilder(prev => ({
      ...prev,
      dataPoints: prev.dataPoints.filter((_, i) => i !== index)
    }));
  };

  const updateDataPoint = (index: number, field: 'x' | 'y', value: string) => {
    setChartBuilder(prev => ({
      ...prev,
      dataPoints: prev.dataPoints.map((point, i) => 
        i === index ? { ...point, [field]: value } : point
      )
    }));
  };

  const createChart = () => {
    const validDataPoints = chartBuilder.dataPoints.filter(point => point.x && point.y);
    if (validDataPoints.length === 0) return;

    const processedData = validDataPoints.map(point => ({
      [chartBuilder.xAxis]: chartBuilder.type === 'pie' ? point.x : (isNaN(Number(point.x)) ? point.x : Number(point.x)),
      [chartBuilder.yAxis]: chartBuilder.type === 'pie' ? Number(point.y) : Number(point.y),
      ...(chartBuilder.type === 'pie' && { name: point.x, value: Number(point.y) })
    }));

    const chart: ChartData = {
      type: chartBuilder.type,
      title: chartBuilder.title,
      description: chartBuilder.description,
      xAxis: chartBuilder.xAxis,
      yAxis: chartBuilder.yAxis,
      data: processedData
    };

    setChartData(chart);
    setShowChartBuilder(false);
  };

  const handleSubmit = () => {
    if (!postData.content.trim()) return;

    const post = {
      author: postData.isAnonymous ? {
        id: 'anonymous',
        name: 'Anonymous User',
        email: '',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
        title: 'Community Member',
        company: '',
        location: '',
        bio: '',
        expertise: [],
        joinDate: '',
        isVerified: false
      } : userProfile,
      content: postData.content,
      type: postData.type,
      tags: postData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      attachments,
      chartData: chartData || undefined,
      isAnonymous: postData.isAnonymous,
      location: postData.location || undefined,
      temperature: postData.temperature ? Number(postData.temperature) : undefined,
      dyeingMethod: postData.dyeingMethod || undefined,
      fabricType: postData.fabricType || undefined,
      likedBy: [],
      bookmarkedBy: []
    };

    onCreatePost(post);
    
    // Reset form
    setPostData({
      content: '',
      type: 'general',
      tags: '',
      isAnonymous: false,
      location: '',
      temperature: '',
      dyeingMethod: '',
      fabricType: ''
    });
    setAttachments([]);
    setChartData(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Create New Post</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPostData(prev => ({ ...prev, isAnonymous: !prev.isAnonymous }))}
                className={`flex items-center gap-2 ${postData.isAnonymous ? 'bg-orange-100 text-orange-700' : ''}`}
              >
                {postData.isAnonymous ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {postData.isAnonymous ? 'Anonymous' : 'Public'}
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Post Type Selection */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Post Type</label>
            <Select.Root value={postData.type} onValueChange={(value) => setPostData(prev => ({ ...prev, type: value as Post['type'] }))}>
              <Select.Trigger className="flex items-center justify-between w-full rounded-lg border border-border shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background text-foreground py-2 px-3">
                <Select.Value />
                <Select.Icon>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </Select.Icon>
              </Select.Trigger>
              <Select.Portal>
                <Select.Content className="overflow-hidden rounded-lg bg-card border border-border shadow-lg z-50">
                  <Select.Viewport className="p-1">
                    {POST_TYPES.map(type => (
                      <Select.Item key={type.value} value={type.value} className="relative flex items-center rounded-md py-2 pl-3 pr-9 text-foreground text-sm outline-none data-[highlighted]:bg-primary/20">
                        <Select.ItemText>{type.label}</Select.ItemText>
                      </Select.Item>
                    ))}
                  </Select.Viewport>
                </Select.Content>
              </Select.Portal>
            </Select.Root>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Content</label>
            <textarea
              value={postData.content}
              onChange={(e) => setPostData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Share your thoughts, methods, questions, or insights..."
              rows={6}
              className="w-full rounded-lg border border-border shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background text-foreground py-2 px-3 resize-none"
            />
          </div>

          {/* Additional Fields for Method Posts */}
          {postData.type === 'method' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  <Thermometer className="inline h-4 w-4 mr-1" />
                  Temperature (°C)
                </label>
                <Input
                  type="number"
                  value={postData.temperature}
                  onChange={(e) => setPostData(prev => ({ ...prev, temperature: e.target.value }))}
                  placeholder="e.g., 130"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  Location/Lab
                </label>
                <Input
                  value={postData.location}
                  onChange={(e) => setPostData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g., Lab A, Production Floor"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Dyeing Method</label>
                <Input
                  value={postData.dyeingMethod}
                  onChange={(e) => setPostData(prev => ({ ...prev, dyeingMethod: e.target.value }))}
                  placeholder="e.g., Reactive Pad-Batch"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Fabric Type</label>
                <Input
                  value={postData.fabricType}
                  onChange={(e) => setPostData(prev => ({ ...prev, fabricType: e.target.value }))}
                  placeholder="e.g., 100% Cotton"
                />
              </div>
            </div>
          )}

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Tags</label>
            <Input
              value={postData.tags}
              onChange={(e) => setPostData(prev => ({ ...prev, tags: e.target.value }))}
              placeholder="cotton, reactive-dye, sustainability (comma-separated)"
            />
          </div>

          {/* Attachments */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Attachments</label>
            <div className="flex gap-2 mb-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2"
              >
                <Image className="h-4 w-4" />
                Add Images
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowChartBuilder(true)}
                className="flex items-center gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                Create Chart
              </Button>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx"
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* Display Attachments */}
            {attachments.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                {attachments.map((attachment) => (
                  <div key={attachment.id} className="relative group">
                    {attachment.type === 'image' ? (
                      <img
                        src={attachment.url}
                        alt={attachment.name}
                        className="w-full h-24 object-cover rounded-lg border border-border"
                      />
                    ) : (
                      <div className="w-full h-24 bg-muted rounded-lg border border-border flex items-center justify-center">
                        <Upload className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <button
                      onClick={() => removeAttachment(attachment.id)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Display Chart */}
            {chartData && (
              <div className="mb-3">
                <div className="bg-card border border-border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-foreground">{chartData.title}</h4>
                    <button
                      onClick={() => setChartData(null)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {chartData.type.charAt(0).toUpperCase() + chartData.type.slice(1)} chart with {chartData.data.length} data points
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Chart Builder Modal */}
          {showChartBuilder && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-card rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Create Chart</h3>
                  <button
                    onClick={() => setShowChartBuilder(false)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Chart Type</label>
                      <select
                        value={chartBuilder.type}
                        onChange={(e) => setChartBuilder(prev => ({ ...prev, type: e.target.value as ChartData['type'] }))}
                        className="w-full rounded-lg border border-border bg-background text-foreground py-2 px-3"
                      >
                        <option value="line">Line Chart</option>
                        <option value="bar">Bar Chart</option>
                        <option value="area">Area Chart</option>
                        <option value="pie">Pie Chart</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Title</label>
                      <Input
                        value={chartBuilder.title}
                        onChange={(e) => setChartBuilder(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Chart title"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Description</label>
                    <Input
                      value={chartBuilder.description}
                      onChange={(e) => setChartBuilder(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description"
                    />
                  </div>

                  {chartBuilder.type !== 'pie' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">X-Axis Label</label>
                        <Input
                          value={chartBuilder.xAxis}
                          onChange={(e) => setChartBuilder(prev => ({ ...prev, xAxis: e.target.value }))}
                          placeholder="e.g., Time, Temperature"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Y-Axis Label</label>
                        <Input
                          value={chartBuilder.yAxis}
                          onChange={(e) => setChartBuilder(prev => ({ ...prev, yAxis: e.target.value }))}
                          placeholder="e.g., Value, Percentage"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-foreground">Data Points</label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addDataPoint}
                        className="flex items-center gap-1"
                      >
                        <Plus className="h-3 w-3" />
                        Add Point
                      </Button>
                    </div>
                    
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {chartBuilder.dataPoints.map((point, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <Input
                            value={point.x}
                            onChange={(e) => updateDataPoint(index, 'x', e.target.value)}
                            placeholder={chartBuilder.type === 'pie' ? 'Label' : chartBuilder.xAxis}
                            className="flex-1"
                          />
                          <Input
                            value={point.y}
                            onChange={(e) => updateDataPoint(index, 'y', e.target.value)}
                            placeholder={chartBuilder.type === 'pie' ? 'Value' : chartBuilder.yAxis}
                            type="number"
                            className="flex-1"
                          />
                          {chartBuilder.dataPoints.length > 1 && (
                            <button
                              onClick={() => removeDataPoint(index)}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowChartBuilder(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={createChart}>
                      Create Chart
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!postData.content.trim()}>
            Post
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};