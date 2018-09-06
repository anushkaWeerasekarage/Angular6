import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { switchMap } from 'rxjs/operators';

import { Dish } from 'src/app/shared/dish';
import { DishService } from '../services/dish.service';
import { Comment } from '../shared/comment';



@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss']
})
export class DishdetailComponent implements OnInit {

  @ViewChild('cform') commentFormDirective;
  dish: Dish;
  dishcopy = null;
  dishIds: number[];
  prev: number;
  next: number;

  commentsForm: FormGroup;
  comment: Comment;

  formError = {
    'author': '',
    'comment': ''
  };
  

  validationMessage = {
    'author': {
      'required':      'Author is required.',
      'minlength':     'Author must be at least 2 characters long.',
    },
    'comment': {
      'required':      'Comment is required.'
    },
  };

  constructor(private dishservice: DishService,
    private route: ActivatedRoute,
    private location: Location,
    private fb: FormBuilder) {
      this.commentForm();
     }


  ngOnInit() {
    this.dishservice.getDishIds().subscribe(dishIds => this.dishIds = dishIds);
    this.route.params.pipe(switchMap((params: Params) => this.dishservice.getDish(+params['id'])))
    .subscribe(dish => { this.dish = dish; this.dishcopy = dish; this.setPrevNext(dish.id); });
  }

  commentForm(): void{
    this.commentsForm = this.fb.group({
      author: ['', [Validators.required, Validators.minLength(2)]],
      rating: 5,
      comment: ['', Validators.required]
    });
    

    this.commentsForm.valueChanges.subscribe(data => this.onValueChanged(data));

    this.onValueChanged(); 
  }

  setPrevNext(dishId: number) {
    const index = this.dishIds.indexOf(dishId);
    this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
    this.next = this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];
  }

  goBack(): void {
    this.location.back();
  }

  onSubmit() {
    this.comment = this.commentsForm.value;
    this.comment.date = (new Date()).toString();
    this.dishcopy.comments.push(this.comment);
    this.dishcopy.save()
      .subscribe(dish => this.dish = dish);
    this.commentsForm.reset({
      author: '',
      rating: 5,
      comment: ''
    });
  
  }

  onValueChanged(data?: any) {
    if (!this.commentsForm) { return; }
    const form = this.commentsForm;
    for (const field in this.formError) {
      if (this.formError.hasOwnProperty(field)) {
        // clear previous error message (if any)
        this.formError[field] = '';
        const control = form.get(field);
        if (control && control.dirty && !control.valid) {
          const messages = this.validationMessage[field];
          for (const key in control.errors) {
            if (control.errors.hasOwnProperty(key)) {
              this.formError[field] += messages[key] + ' ';
            }
          }
        }
      }
    }
  }
}
