import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { Customer } from './customer';



function emailMatcher(c: AbstractControl): { [key: string]: boolean} | null {
  const emailControl = c.get('email');
  const confirmEmail = c.get('confirmEmail');
  
  // Si les champs n'ont pas été touché, on skip la validation
  if(emailControl.pristine || confirmEmail.pristine)
  {
    return null;
  }
  if(emailControl.value === confirmEmail.value)
  {
    return null;
  }
  return { 'match': true};
}

function ratingRange(min: number, max: number): ValidatorFn {
  return (c: AbstractControl): { [key: string]: boolean } | null => {
    if(c.value != null && (isNaN(c.value) || c.value < min || c.value > max))
    {
      // Cas ou le validateur n'est pas passé
      return {'range': true}
    }
    // Cas ou le validateur est passé
    return null;
  };
}


@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.css']
})
export class CustomerComponent implements OnInit {
  customerForm: FormGroup;
  customer = new Customer();

  constructor(private fb: FormBuilder) { }

  ngOnInit() {

    this.customerForm = this.fb.group({
      firstName: ['',[Validators.required,Validators.minLength(3)]],
      lastName: ['',[Validators.required, Validators.maxLength(50)]],
      emailGroup: this.fb.group({
        email: ['',[Validators.required, Validators.email]],
        confirmEmail: ['',Validators.required],
      }, {validator: emailMatcher}),
      sendCatalog: true,
      phone: '',
      notification: 'email',
      rating: [null, ratingRange(1,5)]
    });

    /*
    this.customerForm = new FormGroup({
      firstName: new FormControl(),
      lastName: new FormControl(),
      email: new FormControl(),
      sendCatalog: new FormControl(true)
    });
    */
  }

  save() {
    console.log(this.customerForm);
    console.log('Saved: ' + JSON.stringify(this.customerForm.value));
  }

  populateTestData(): void {

    this.customerForm.setValue({
      firstName: 'Jack',
      lastName: 'Harkness',
      emailGroup:{
        email:'test@test.com',
        confirmEmail:'test@test.com',
      },
      sendCatalog: false,
      rating:4,
      notification:'text',
      phone:'0491230412'
    });
    this.customerForm.patchValue({
      firstName: 'Nicolas'
    });
  }

  setNotification(viaString: string): void {
    const phoneControl = this.customerForm.get('phone');
    if(viaString === 'text')
    {
      phoneControl.setValidators(Validators.required);
    }
    else
    {
      phoneControl.clearValidators();
    }

    phoneControl.updateValueAndValidity();
  }
}
