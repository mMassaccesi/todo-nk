import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';
import {Task} from '../model/task';
import {TodoRestService} from '../service/todo-rest.service';

import { FormGroup, FormBuilder, FormControl, Validators} from '@angular/forms';

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css']
})
export class TaskComponent implements OnInit {

  @Input() task: Task;

  @Output() notify: EventEmitter<string> = new EventEmitter<string>();

  editable: boolean = false;
  isSubmitted = false;
  form: FormGroup;
  toggleTaskProcessing = false;

  constructor(private todoService: TodoRestService, private fb: FormBuilder) {
    console.log('task component created: ');
  }

  ngOnInit() {
    console.log('On init called of task component: ');
    this.form = this.fb.group({
      updatedTask: new FormControl(this.task.name, [Validators.required])
    });
  }

  toggleTask() {
    console.log('toggle called');
    console.log(this.task.id);
    this.toggleTaskProcessing = true;
    this.todoService.updateDone(this.task.id, !this.task.isDone)
    .then(() => {
      this.notify.emit('toggled');
    });
  }

  deleteTask() {
    console.log('delete called');
    console.log(this.task.id);
    this.todoService.delete(this.task.id)
    .then(() => {
      console.log('promise fulfilled for delete')
      this.notify.emit('deleted');
    });
  }

  enableEditing() {
    this.editable = true;
  }

  disableEditing() {
    this.editable = false;
    this.form.setValue({
      updatedTask: this.task.name
    });
    console.log(this.form.get('updatedTask').value);

  }

  editName({value, valid}: {value: FormGroup, valid: boolean}) {
    this.isSubmitted = true;
    console.log('edit name called');
    console.log('valid: ' + valid);
    if (!valid) {
      return;
    }

    if (!(this.form.get('updatedTask').value === this.task.name)){
      let newTask = new Task(this.task.id, this.form.get('updatedTask').value, this.task.isDone);
      this.todoService.update(newTask)
      .then(() => {
        this.task = newTask;
        this.notify.emit('edited');
      });
    }

    this.editable = false;
    this.isSubmitted = false;
    this.form.setValue({
      updatedTask: this.task.name
    });
    this.form.reset();
  }
}
