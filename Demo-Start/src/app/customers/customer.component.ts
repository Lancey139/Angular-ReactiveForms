import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators, AbstractControl, ValidatorFn, FormArray } from '@angular/forms';
import { Customer } from './customer';
import { debounceTime } from 'rxjs/operators';


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
  emailMessage: string;

  get addresses(): FormArray{
    return <FormArray>this.customerForm.get('addresses');
  }
  
  // Pour le moment on met nos messages ici mais à terme il faut les 
  // mettre dans le back end
  // Attention, les clés ici doivent matche les clé qui identifient nos erreurs
  private validationMessages = {
    required: 'Please enter your email address.',
    email: 'Please enter a valid email adress'
  };
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
      rating: [null, ratingRange(1,5)],
      addresses: this.fb.array([ this.buildAddress() ])
    });

    this.customerForm.get('notification').valueChanges.subscribe(
      value => this.setNotification(value));

    const emailControl = this.customerForm.get('emailGroup.email');
    emailControl.valueChanges.pipe(debounceTime(1000)).subscribe(
      value => this.setMessage(emailControl)
    );
  }

  buildAddress(): FormGroup {
    return this.fb.group({
      addressType: 'home',
      street1: '',
      street2: '',
      city: '',
      state: '',
      zip: ''
    });
  }

  save() {
    console.log(this.customerForm);
    console.log('Saved: ' + JSON.stringify(this.customerForm.value));
  }

  setMessage(c: AbstractControl): void {
    this.emailMessage = '';
    if((c.touched || c.dirty) && c.errors)
    {
      // Pour chaque élément des clés du tableau d'erreur, on cherche la clé
      // correspondante dans notre tableau de message d'erreur. On concatène ces 
      // messages en un seul séparé par un espace avec join
      this.emailMessage = Object.keys(c.errors).map(
        key => this.validationMessages[key]).join(' ');
    }
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

  addAddress():void {
    // On peut utiliser this.addresses grace au getter
    this.addresses.push(this.buildAddress());
  }
}
