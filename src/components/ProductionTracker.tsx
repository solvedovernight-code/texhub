import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  Beaker, 
  Droplets, 
  Sparkles, 
  CheckCircle, 
  Package, 
  Clock, 
  User, 
  Play, 
  Pause, 
  Check,
  AlertTriangle,
  Plus,
  BarChart3,
  Activity,
  Target,
  Timer,
  Users,
  Wrench
} from 'lucide-react';
import { ProductionStage, QualityCheck } from '../types/order';
import { Button } from './ui/button';
import { Input } from './ui/input';
import * as Select from '@radix-ui/react-select';

interface ProductionTrackerProps {
  stages: ProductionStage[];
  qualityChecks: QualityCheck[];
  onStagesChange: (stages: ProductionStage[]) => void;
  onQualityChecksChange: (checks: QualityCheck[]) => void;
}

const stageIcons = {
  preparation: Settings,
  dyeing: Beaker,
  washing: Droplets,
  finishing: Sparkles,
  'quality-check': CheckCircle,
  packaging: Package,
};

const stageColors = {
  preparation: 'from-blue-400 to-blue-600',
  dyeing: 'from-purple-400 to-purple-600',
  washing: 'from-cyan-400 to-cyan-600',
  finishing: 'from-pink-400 to-pink-600',
  'quality-check': 'from-green-400 to-green-600',
  packaging: 'from-orange-400 to-orange-600',
};

const statusColors = {
  pending: 'bg-gray-100 text-gray-800 border-gray-200',
  'in-progress': 'bg-blue-100 text-blue-800 border-blue-200',
  completed: 'bg-green-100 text-green-800 border-green-200',
  'on-hold': 'bg-red-100 text-red-800 border-red-200',
};

export const ProductionTracker: React.FC<ProductionTrackerProps> = ({
  stages,
  qualityChecks,
  onStagesChange,
  onQualityChecksChange,
}) => {
  const [activeTab, setActiveTab] = useState<'stages' | 'quality'>('stages');
  const [newQualityCheck, setNewQualityCheck] = useState<Partial<QualityCheck>>({
    checkType: 'in-process',
    inspector: '',
    checkDate: new Date().toISOString().split('T')[0],
    status: 'passed',
    notes: '',
  });

  const updateStage = (stageId: string, field: keyof ProductionStage, value: any) => {
    const updatedStages = stages.map(stage => {
      if (stage.id === stageId) {
        const updatedStage = { ...stage, [field]: value };
        
        // Auto-set dates when status changes
        if (field === 'status') {
          if (value === 'in-progress' && !stage.startDate) {
            updatedStage.startDate = new Date().toISOString();
          } else if (value === 'completed' && !stage.endDate) {
            updatedStage.endDate = new Date().toISOString();
            if (stage.startDate) {
              const start = new Date(stage.startDate);
              const end = new Date();
              updatedStage.actualDuration = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60));
            }
          }
        }
        
        return updatedStage;
      }
      return stage;
    });
    onStagesChange(updatedStages);
  };

  const addQualityCheck = () => {
    if (!newQualityCheck.inspector || !newQualityCheck.notes) return;
    
    const qualityCheck: QualityCheck = {
      id: Date.now().toString(),
      checkType: newQualityCheck.checkType as 'incoming' | 'in-process' | 'final',
      inspector: newQualityCheck.inspector!,
      checkDate: newQualityCheck.checkDate!,
      status: newQualityCheck.status as 'passed' | 'failed' | 'conditional',
      notes: newQualityCheck.notes!,
    };
    
    onQualityChecksChange([...qualityChecks, qualityCheck]);
    setNewQualityCheck({
      checkType: 'in-process',
      inspector: '',
      checkDate: new Date().toISOString().split('T')[0],
      status: 'passed',
      notes: '',
    });
  };

  const getStageProgress = () => {
    const completedStages = stages.filter(stage => stage.status === 'completed').length;
    return (completedStages / stages.length) * 100;
  };

  const getTotalEstimatedTime = () => {
    return stages.reduce((total, stage) => total + stage.estimatedDuration, 0);
  };

  const getTotalActualTime = () => {
    return stages.reduce((total, stage) => total + (stage.actualDuration || 0), 0);
  };

  return (
    <div className="bg-card p-8 rounded-2xl border border-border shadow-lg">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
            <Activity className="h-8 w-8 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-foreground">Production Tracking</h3>
            <p className="text-muted-foreground text-lg">Monitor every stage of your production process</p>
          </div>
        </div>
        
        {/* Progress Overview */}
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{Math.round(getStageProgress())}%</div>
            <div className="text-sm text-muted-foreground">Complete</div>
          </div>
          <div className="w-32 h-3 bg-muted rounded-full overflow-hidden shadow-inner">
            <motion.div 
              className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${getStageProgress()}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-foreground">{getTotalActualTime()}h</div>
            <div className="text-sm text-muted-foreground">of {getTotalEstimatedTime()}h</div>
          </div>
        </div>
      </div>

      {/* Enhanced Tabs */}
      <div className="flex space-x-2 bg-muted/50 p-2 rounded-xl w-fit mb-8">
        <button
          onClick={() => setActiveTab('stages')}
          className={`px-6 py-3 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center gap-3 ${
            activeTab === 'stages'
              ? 'bg-card shadow-lg text-foreground border border-border/50'
              : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
          }`}
        >
          <Target className="h-5 w-5" />
          Production Stages
          <span className="bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-bold">
            {stages.filter(s => s.status === 'completed').length}/{stages.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('quality')}
          className={`px-6 py-3 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center gap-3 ${
            activeTab === 'quality'
              ? 'bg-card shadow-lg text-foreground border border-border/50'
              : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
          }`}
        >
          <CheckCircle className="h-5 w-5" />
          Quality Checks
          <span className="bg-secondary text-secondary-foreground px-2 py-1 rounded-full text-xs font-bold">
            {qualityChecks.length}
          </span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'stages' ? (
          <motion.div
            key="stages"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {stages.map((stage, index) => {
              const Icon = stageIcons[stage.stage];
              const isActive = stage.status === 'in-progress';
              const isCompleted = stage.status === 'completed';
              const isOnHold = stage.status === 'on-hold';
              const gradientColor = stageColors[stage.stage] || 'from-gray-400 to-gray-600';
              
              return (
                <motion.div
                  key={stage.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                    isActive ? 'border-primary bg-primary/5 shadow-lg' : 
                    isCompleted ? 'border-green-500 bg-green-50 dark:bg-green-900/20' :
                    isOnHold ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
                    'border-border bg-background hover:bg-muted/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-6">
                      <motion.div 
                        className={`p-4 rounded-2xl shadow-lg ${
                          isCompleted ? `bg-gradient-to-br from-green-400 to-green-600` :
                          isActive ? `bg-gradient-to-br ${gradientColor} animate-pulse` :
                          isOnHold ? 'bg-gradient-to-br from-red-400 to-red-600' :
                          'bg-muted'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Icon className={`h-8 w-8 ${
                          isCompleted || isActive || isOnHold ? 'text-white' : 'text-muted-foreground'
                        }`} />
                      </motion.div>
                      <div>
                        <h4 className="text-xl font-bold text-foreground capitalize mb-1">
                          {stage.stage.replace('-', ' ')}
                        </h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Timer className="h-4 w-4" />
                            <span>Est. {stage.estimatedDuration}h</span>
                          </div>
                          {stage.actualDuration && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>Actual: {stage.actualDuration}h</span>
                            </div>
                          )}
                          {stage.assignedTo && (
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              <span>{stage.assignedTo}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <span className={`px-4 py-2 rounded-xl text-sm font-bold border-2 ${statusColors[stage.status]}`}>
                        {stage.status.replace('-', ' ').toUpperCase()}
                      </span>
                      
                      <Select.Root 
                        value={stage.status} 
                        onValueChange={(value) => updateStage(stage.id, 'status', value)}
                      >
                        <Select.Trigger className="flex items-center justify-between w-40 rounded-xl border border-border bg-background text-foreground py-2 px-4 shadow-sm hover:shadow-md transition-all">
                          <Select.Value />
                          <Select.Icon>
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                          </Select.Icon>
                        </Select.Trigger>
                        <Select.Portal>
                          <Select.Content className="overflow-hidden rounded-xl bg-card border border-border shadow-2xl z-50">
                            <Select.Viewport className="p-2">
                              <Select.Item value="pending" className="relative flex items-center rounded-lg py-3 pl-4 pr-12 text-foreground text-sm outline-none data-[highlighted]:bg-primary/20 transition-colors">
                                <Clock className="h-4 w-4 mr-3 text-gray-500" />
                                <Select.ItemText>Pending</Select.ItemText>
                              </Select.Item>
                              <Select.Item value="in-progress" className="relative flex items-center rounded-lg py-3 pl-4 pr-12 text-foreground text-sm outline-none data-[highlighted]:bg-primary/20 transition-colors">
                                <Play className="h-4 w-4 mr-3 text-blue-500" />
                                <Select.ItemText>In Progress</Select.ItemText>
                              </Select.Item>
                              <Select.Item value="completed" className="relative flex items-center rounded-lg py-3 pl-4 pr-12 text-foreground text-sm outline-none data-[highlighted]:bg-primary/20 transition-colors">
                                <CheckCircle className="h-4 w-4 mr-3 text-green-500" />
                                <Select.ItemText>Completed</Select.ItemText>
                              </Select.Item>
                              <Select.Item value="on-hold" className="relative flex items-center rounded-lg py-3 pl-4 pr-12 text-foreground text-sm outline-none data-[highlighted]:bg-primary/20 transition-colors">
                                <Pause className="h-4 w-4 mr-3 text-red-500" />
                                <Select.ItemText>On Hold</Select.ItemText>
                              </Select.Item>
                            </Select.Viewport>
                          </Select.Content>
                        </Select.Portal>
                      </Select.Root>
                    </div>
                  </div>
                  
                  {/* Stage Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        <User className="inline h-4 w-4 mr-2" />
                        Assigned To
                      </label>
                      <Input
                        value={stage.assignedTo}
                        onChange={(e) => updateStage(stage.id, 'assignedTo', e.target.value)}
                        placeholder="Operator name"
                        className="rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        <Wrench className="inline h-4 w-4 mr-2" />
                        Machine No
                      </label>
                      <Input
                        value={stage.machineNo || ''}
                        onChange={(e) => updateStage(stage.id, 'machineNo', e.target.value)}
                        placeholder="Machine number"
                        className="rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        <Package className="inline h-4 w-4 mr-2" />
                        Batch No
                      </label>
                      <Input
                        value={stage.batchNo || ''}
                        onChange={(e) => updateStage(stage.id, 'batchNo', e.target.value)}
                        placeholder="Batch number"
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                  
                  {/* Stage Notes */}
                  {stage.notes !== undefined && (
                    <div className="mt-6">
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Production Notes
                      </label>
                      <textarea
                        value={stage.notes}
                        onChange={(e) => updateStage(stage.id, 'notes', e.target.value)}
                        placeholder="Add notes about this production stage..."
                        className="w-full rounded-xl border border-border bg-background text-foreground py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                        rows={3}
                      />
                    </div>
                  )}

                  {/* Time Tracking */}
                  {(stage.startDate || stage.endDate) && (
                    <div className="mt-6 p-4 bg-muted/30 rounded-xl border border-border/50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {stage.startDate && (
                          <div>
                            <span className="text-muted-foreground">Started:</span>
                            <span className="ml-2 font-medium text-foreground">
                              {new Date(stage.startDate).toLocaleString()}
                            </span>
                          </div>
                        )}
                        {stage.endDate && (
                          <div>
                            <span className="text-muted-foreground">Completed:</span>
                            <span className="ml-2 font-medium text-foreground">
                              {new Date(stage.endDate).toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            key="quality"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* Add Quality Check Form */}
            <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 p-6 rounded-2xl border border-border/50">
              <h4 className="font-bold text-foreground mb-6 text-lg flex items-center">
                <Plus className="h-5 w-5 mr-2" />
                Add Quality Check
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Check Type</label>
                  <Select.Root 
                    value={newQualityCheck.checkType} 
                    onValueChange={(value) => setNewQualityCheck(prev => ({ ...prev, checkType: value as any }))}
                  >
                    <Select.Trigger className="flex items-center justify-between w-full rounded-xl border border-border bg-background text-foreground py-3 px-4">
                      <Select.Value placeholder="Check Type" />
                      <Select.Icon>
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </Select.Icon>
                    </Select.Trigger>
                    <Select.Portal>
                      <Select.Content className="overflow-hidden rounded-xl bg-card border border-border shadow-2xl z-50">
                        <Select.Viewport className="p-2">
                          <Select.Item value="incoming" className="relative flex items-center rounded-lg py-3 pl-4 pr-12 text-foreground text-sm outline-none data-[highlighted]:bg-primary/20">
                            <Select.ItemText>Incoming Inspection</Select.ItemText>
                          </Select.Item>
                          <Select.Item value="in-process" className="relative flex items-center rounded-lg py-3 pl-4 pr-12 text-foreground text-sm outline-none data-[highlighted]:bg-primary/20">
                            <Select.ItemText>In-Process Check</Select.ItemText>
                          </Select.Item>
                          <Select.Item value="final" className="relative flex items-center rounded-lg py-3 pl-4 pr-12 text-foreground text-sm outline-none data-[highlighted]:bg-primary/20">
                            <Select.ItemText>Final Inspection</Select.ItemText>
                          </Select.Item>
                        </Select.Viewport>
                      </Select.Content>
                    </Select.Portal>
                  </Select.Root>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Inspector</label>
                  <Input
                    value={newQualityCheck.inspector || ''}
                    onChange={(e) => setNewQualityCheck(prev => ({ ...prev, inspector: e.target.value }))}
                    placeholder="Inspector name"
                    className="rounded-xl"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Status</label>
                  <Select.Root 
                    value={newQualityCheck.status} 
                    onValueChange={(value) => setNewQualityCheck(prev => ({ ...prev, status: value as any }))}
                  >
                    <Select.Trigger className="flex items-center justify-between w-full rounded-xl border border-border bg-background text-foreground py-3 px-4">
                      <Select.Value placeholder="Status" />
                      <Select.Icon>
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </Select.Icon>
                    </Select.Trigger>
                    <Select.Portal>
                      <Select.Content className="overflow-hidden rounded-xl bg-card border border-border shadow-2xl z-50">
                        <Select.Viewport className="p-2">
                          <Select.Item value="passed" className="relative flex items-center rounded-lg py-3 pl-4 pr-12 text-foreground text-sm outline-none data-[highlighted]:bg-primary/20">
                            <CheckCircle className="h-4 w-4 mr-3 text-green-500" />
                            <Select.ItemText>Passed</Select.ItemText>
                          </Select.Item>
                          <Select.Item value="failed" className="relative flex items-center rounded-lg py-3 pl-4 pr-12 text-foreground text-sm outline-none data-[highlighted]:bg-primary/20">
                            <AlertTriangle className="h-4 w-4 mr-3 text-red-500" />
                            <Select.ItemText>Failed</Select.ItemText>
                          </Select.Item>
                          <Select.Item value="conditional" className="relative flex items-center rounded-lg py-3 pl-4 pr-12 text-foreground text-sm outline-none data-[highlighted]:bg-primary/20">
                            <Clock className="h-4 w-4 mr-3 text-yellow-500" />
                            <Select.ItemText>Conditional</Select.ItemText>
                          </Select.Item>
                        </Select.Viewport>
                      </Select.Content>
                    </Select.Portal>
                  </Select.Root>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Date</label>
                  <input
                    type="date"
                    value={newQualityCheck.checkDate || ''}
                    onChange={(e) => setNewQualityCheck(prev => ({ ...prev, checkDate: e.target.value }))}
                    className="w-full rounded-xl border border-border bg-background text-foreground py-3 px-4"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-end">
                <div className="lg:col-span-3">
                  <label className="block text-sm font-semibold text-foreground mb-2">Quality Check Notes</label>
                  <textarea
                    value={newQualityCheck.notes || ''}
                    onChange={(e) => setNewQualityCheck(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Detailed quality check observations and results..."
                    className="w-full rounded-xl border border-border bg-background text-foreground py-3 px-4 text-sm resize-none"
                    rows={3}
                  />
                </div>
                <div>
                  <Button 
                    onClick={addQualityCheck} 
                    className="w-full h-[88px] bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl shadow-lg"
                    disabled={!newQualityCheck.inspector || !newQualityCheck.notes}
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Add Check
                  </Button>
                </div>
              </div>
            </div>

            {/* Quality Checks List */}
            <div className="space-y-4">
              {qualityChecks.length === 0 ? (
                <div className="text-center py-12 bg-muted/20 rounded-2xl border border-border/50">
                  <CheckCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-semibold text-foreground">No quality checks recorded yet</p>
                  <p className="text-muted-foreground">Add quality checks to track inspection results and maintain quality standards</p>
                </div>
              ) : (
                qualityChecks.map((check, index) => (
                  <motion.div
                    key={check.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-6 rounded-2xl border border-border bg-background shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${
                          check.status === 'passed' ? 'bg-gradient-to-br from-green-400 to-green-600' :
                          check.status === 'failed' ? 'bg-gradient-to-br from-red-400 to-red-600' :
                          'bg-gradient-to-br from-yellow-400 to-yellow-600'
                        }`}>
                          {check.status === 'passed' ? <CheckCircle className="h-6 w-6 text-white" /> :
                           check.status === 'failed' ? <AlertTriangle className="h-6 w-6 text-white" /> :
                           <Clock className="h-6 w-6 text-white" />}
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-foreground capitalize">
                            {check.checkType.replace('-', ' ')} Quality Check
                          </h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              <span>By {check.inspector}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(check.checkDate).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <span className={`px-4 py-2 rounded-xl text-sm font-bold ${
                        check.status === 'passed' ? 'bg-green-100 text-green-800 border-2 border-green-200' :
                        check.status === 'failed' ? 'bg-red-100 text-red-800 border-2 border-red-200' :
                        'bg-yellow-100 text-yellow-800 border-2 border-yellow-200'
                      }`}>
                        {check.status.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                      <p className="text-foreground leading-relaxed">{check.notes}</p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};