'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Filter, ChevronDown } from 'lucide-react';
import { cn } from "@/lib/utils";
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import { Tables } from '@/types/supabase';

// TypeScript interfaces
interface Task {
  id: number | null;
  title: string;
  description: string;
  dueDate: string; // Format: YYYY-MM-DD
  priority: 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
  related_to_text: string;
  assigned_to_user_id: string;
  completed: boolean;
}

interface TaskManagementProps {
  initialTasks: Tables<'tasks'>[];
  loading: boolean; // Prop indicating if initial tasks are loading
}

const priorityColors: Record<string, string> = {
  'High': 'from-red-500/20 to-red-500/20 text-red-300',
  'Medium': 'from-yellow-500/20 to-yellow-500/20 text-yellow-300',
  'Low': 'from-blue-500/20 to-blue-500/20 text-blue-300',
};

const statusColors: Record<string, string> = {
  'Pending': 'from-yellow-500/20 to-yellow-500/20 text-yellow-300',
  'In Progress': 'from-indigo-500/20 to-purple-500/20 text-indigo-300',
  'Completed': 'from-green-500/20 to-green-500/20 text-green-300',
  'Cancelled': 'from-gray-500/20 to-gray-500/20 text-gray-300',
};


const priorities: Array<Task['priority']> = ['High', 'Medium', 'Low'];
const statuses: Array<Task['status']> = ['Pending', 'In Progress', 'Completed', 'Cancelled'];

export default function TaskManagement({ initialTasks = [], loading: isLoadingInitialData = false }: TaskManagementProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState<string>('All');
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [isProcessingAction, setIsProcessingAction] = useState(false); // For component's own actions
  const [teamMembers, setTeamMembers] = useState<{id: string, name: string}[]>([]);

  // Fetch authenticated users
  useEffect(() => {
    const fetchUsers = async () => {
      const supabase = createClient();
      try {
        const { data, error } = await supabase
          .from('freelancers') // Assuming 'freelancers' table stores users with 'id' and 'name'
          .select('id, name').or('role.eq.admin,role.eq.marketing'); // Only select necessary fields
          
        if (error) throw error;
        
        if (data) {
          setTeamMembers(data.map(user => ({
            id: user.id,
            name: user.name  || 'Unnamed User'
          })));
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Error fetching users', {
          description: 'Failed to load team members.'
        });
        setTeamMembers([]); // Fallback to empty array
      }
    };
    
    fetchUsers();
  }, []);

  // Initialize tasks from props
  useEffect(() => {
    if (initialTasks && initialTasks.length > 0) {
      const formattedTasks = initialTasks.map(dbTask => ({
        id: dbTask.id,
        title: dbTask.title || '',
        description: dbTask.description || '',
        dueDate: dbTask.due_date ? dbTask.due_date.split('T')[0] : new Date().toISOString().split('T')[0],
        priority: (dbTask.priority as Task['priority']) || 'Medium',
        status: (dbTask.status as Task['status']) || 'Pending',
        related_to_text: dbTask.related_to_text || '',
        assigned_to_user_id: dbTask.assigned_to_user_id || '',
        completed: dbTask.status === 'Completed',
      }));
      setTasks(formattedTasks);
    } else {
      setTasks([]); // Set to empty if initialTasks is empty or null
    }
  }, [initialTasks]);

  const filteredTasks: Task[] = filter === 'All' 
    ? tasks 
    : filter === 'Completed' 
      ? tasks.filter(task => task.completed) 
      : tasks.filter(task => !task.completed); // 'Active' tasks

  const handleAddTask = () => {
    setCurrentTask({
      id: null,
      title: '',
      description: '',
      dueDate: new Date().toISOString().split('T')[0],
      priority: 'Medium',
      status: 'Pending',
      related_to_text: '',
      assigned_to_user_id: '', // Corrected field
      completed: false,
    });
    setDialogOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setCurrentTask(task);
    setDialogOpen(true);
  };

  const handleDeleteTask = async (id: number | null) => {
    if (!id) return;
    
    setIsProcessingAction(true);
    const supabase = createClient();
    
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      setTasks(prev => prev.filter(task => task.id !== id));
      toast.success('Task deleted', {
        description: 'Task has been successfully deleted.'
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Error deleting task', {
        description: 'Please try again.'
      });
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleSaveTask = async () => {
    if (!currentTask) return;
    
    setIsProcessingAction(true);
    const supabase = createClient();
    
    try {
      const taskData = {
        title: currentTask.title,
        description: currentTask.description,
        due_date: currentTask.dueDate, // Matches Supabase column
        priority: currentTask.priority,
        status: currentTask.status,
        related_to_text: currentTask.related_to_text, // Matches Supabase column
        assigned_to_user_id: currentTask.assigned_to_user_id, // Matches Supabase column
        completed: currentTask.completed, // Kept in sync by UI logic
      };
      
      if (currentTask.id) {
        const { error } = await supabase
          .from('tasks')
          .update(taskData)
          .eq('id', currentTask.id);
          
        if (error) throw error;
        
        setTasks(prev => prev.map(task => 
          task.id === currentTask.id ? { ...currentTask } : task // Ensure a new object for currentTask
        ));
        toast.success('Task updated', {
          description: 'Task has been successfully updated.'
        });
      } else {
        const { data, error } = await supabase
          .from('tasks')
          .insert(taskData)
          .select()
          .single(); // Expect a single object back
          
        if (error) throw error;
        
        if (data) {
          const newTask: Task = { // Map Supabase response to Task interface
            id: data.id,
            title: data.title || '',
            description: data.description || '',
            dueDate: data.due_date ? data.due_date.split('T')[0] : new Date().toISOString().split('T')[0],
            priority: (data.priority as Task['priority']) || 'Medium',
            status: (data.status as Task['status']) || 'Pending',
            related_to_text: data.related_to_text || '',
            assigned_to_user_id: data.assigned_to_user_id || '',
            completed: data.status === 'Completed',
          };
          setTasks(prev => [...prev, newTask]);
        }
        toast.success('Task created', {
          description: 'New task has been successfully created.'
        });
      }
      setDialogOpen(false);
    } catch (error) {
      console.error('Error saving task:', error);
      toast.error('Error saving task', {
        description: 'Please try again.'
      });
    } finally {
      setIsProcessingAction(false);
    }
  };

  const toggleTaskCompletion = async (id: number | null) => {
    if (!id) return;
    
    const taskToUpdate = tasks.find(task => task.id === id);
    if (!taskToUpdate) return;
    
    const newCompletedState = !taskToUpdate.completed;
    const newStatus = newCompletedState ? 'Completed' : (taskToUpdate.status === 'Completed' ? 'Pending' : taskToUpdate.status);
    
    setIsProcessingAction(true);
    const supabase = createClient();
    
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          status: newStatus,
          completed: newCompletedState
        })
        .eq('id', id);
        
      if (error) throw error;
      
      setTasks(tasks.map(task => 
        task.id === id 
        ? { ...task, completed: newCompletedState, status: newStatus } 
        : task
      ));
      toast.success(newCompletedState ? 'Task marked as completed' : 'Task marked as not completed');
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Error updating task status', {
        description: 'Please try again.'
      });
    } finally {
      setIsProcessingAction(false);
    }
  };

  const getUserNameById = (userId: string): string => {
    if (!userId) return 'Unassigned';
    const member = teamMembers.find(m => m.id === userId);
    return member ? member.name : userId; // Fallback to ID if name not found
  };

  return (
    <Card className="border-gray-700 bg-gray-800/60 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-semibold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Task Management</CardTitle>
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 border-gray-700 bg-gray-800/60 text-gray-200 hover:bg-gray-700/60" disabled={isProcessingAction || isLoadingInitialData}>
                <Filter className="h-4 w-4" />
                <span>Filter: {filter}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-800 border-gray-700">
              <DropdownMenuItem className="text-gray-200 focus:bg-gray-700" onClick={() => setFilter('All')}>All Tasks</DropdownMenuItem>
              <DropdownMenuItem className="text-gray-200 focus:bg-gray-700" onClick={() => setFilter('Active')}>Active Tasks</DropdownMenuItem>
              <DropdownMenuItem className="text-gray-200 focus:bg-gray-700" onClick={() => setFilter('Completed')}>Completed Tasks</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button 
            onClick={handleAddTask} 
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
            disabled={isProcessingAction || isLoadingInitialData}
          >
            <Plus className="h-4 w-4" />
            <span>Add Task</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          {isLoadingInitialData ? (
            <div className="text-center py-8 text-gray-400">Loading tasks data...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700">
                  <TableHead className="w-[50px] text-gray-300"></TableHead>
                  <TableHead className="text-gray-300">Title</TableHead>
                  <TableHead className="text-gray-300">Due Date</TableHead>
                  <TableHead className="text-gray-300">Priority</TableHead>
                  <TableHead className="text-gray-300">Status</TableHead>
                  <TableHead className="text-gray-300">Assigned To</TableHead>
                  <TableHead className="text-gray-300">Related To</TableHead>
                  <TableHead className="text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.length > 0 ? (
                  filteredTasks.map((task) => (
                    <TableRow key={task.id} className={cn("border-gray-700", task.completed ? "opacity-70" : "")}>
                      <TableCell>
                        <Checkbox 
                          checked={task.completed} 
                          onCheckedChange={() => toggleTaskCompletion(task.id)}
                          className="border-gray-600 data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500"
                          disabled={isProcessingAction}
                        />
                      </TableCell>
                      <TableCell className={`font-medium text-gray-200 ${task.completed ? "line-through" : ""}`}>
                        {task.title}
                      </TableCell>
                      <TableCell className="text-gray-200">
                        {new Date(task.dueDate + 'T00:00:00').toLocaleDateString()} {/* Ensure date is parsed correctly for local timezone */}
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("bg-gradient-to-r border-gray-700", priorityColors[task.priority])}>
                          {task.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("bg-gradient-to-r border-gray-700", statusColors[task.status])}>
                          {task.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-200">{getUserNameById(task.assigned_to_user_id)}</TableCell>
                      <TableCell className="text-gray-200">{task.related_to_text}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="hover:bg-gray-700/60 text-gray-300"
                            onClick={() => handleEditTask(task)}
                            disabled={isProcessingAction}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="hover:bg-gray-700/60"
                            onClick={() => handleDeleteTask(task.id)}
                            disabled={isProcessingAction}
                          >
                            <Trash2 className="h-4 w-4 text-red-400" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4 text-gray-400">
                      No tasks found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[425px] bg-gray-800 border-gray-700 text-gray-200">
            <DialogHeader>
              <DialogTitle className="text-white">{currentTask && currentTask.id ? 'Edit Task' : 'Add Task'}</DialogTitle>
              <DialogDescription className="text-gray-400">
                {currentTask && currentTask.id ? 'Make changes to the task here.' : 'Add a new task to your list.'}
              </DialogDescription>
            </DialogHeader>
            {currentTask && (
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title" className="text-gray-300">Title</Label>
                  <Input
                    id="title"
                    className="bg-gray-700/60 border-gray-600 text-gray-200"
                    value={currentTask.title}
                    onChange={(e) => setCurrentTask({...currentTask, title: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description" className="text-gray-300">Description</Label>
                  <Textarea
                    id="description"
                    className="bg-gray-700/60 border-gray-600 text-gray-200"
                    value={currentTask.description}
                    onChange={(e) => setCurrentTask({...currentTask, description: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="dueDate" className="text-gray-300">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    className="bg-gray-700/60 border-gray-600 text-gray-200"
                    value={currentTask.dueDate} // Should be YYYY-MM-DD
                    onChange={(e) => setCurrentTask({...currentTask, dueDate: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="priority" className="text-gray-300">Priority</Label>
                  <Select
                    value={currentTask.priority}
                    onValueChange={(value: Task['priority']) => setCurrentTask({...currentTask, priority: value})}
                  >
                    <SelectTrigger className="bg-gray-700/60 border-gray-600 text-gray-200">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 text-gray-200">
                      {priorities.map((priority) => (
                        <SelectItem key={priority} value={priority} className="focus:bg-gray-700 text-gray-200">
                          {priority}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status" className="text-gray-300">Status</Label>
                  <Select
                    value={currentTask.status}
                    onValueChange={(value: Task['status']) => {
                      const completed = value === 'Completed';
                      setCurrentTask({...currentTask, status: value, completed});
                    }}
                  >
                    <SelectTrigger className="bg-gray-700/60 border-gray-600 text-gray-200">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 text-gray-200">
                      {statuses.map((status) => (
                        <SelectItem key={status} value={status} className="focus:bg-gray-700 text-gray-200">
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="assignedTo" className="text-gray-300">Assigned To</Label>
                  <Select
                    value={currentTask.assigned_to_user_id} // Corrected field
                    onValueChange={(value) => setCurrentTask({...currentTask, assigned_to_user_id: value})} // Corrected field
                  >
                    <SelectTrigger className="bg-gray-700/60 border-gray-600 text-gray-200">
                      <SelectValue placeholder="Select team member" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 text-gray-200">
                      {teamMembers.length > 0 ? (
                        teamMembers.map((member) => (
                          <SelectItem key={member.id} value={member.id} className="focus:bg-gray-100 text-gray-200">
                            {member.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="" disabled className="text-gray-400">
                          No team members available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="relatedTo" className="text-gray-300">Related To</Label>
                  <Input
                    id="relatedTo"
                    className="bg-gray-700/60 border-gray-600 text-gray-200"
                    value={currentTask.related_to_text}
                    onChange={(e) => setCurrentTask({...currentTask, related_to_text: e.target.value})}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button 
                onClick={handleSaveTask} 
                className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                disabled={isProcessingAction}
              >
                {isProcessingAction ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}