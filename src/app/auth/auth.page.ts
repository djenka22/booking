import {Component, OnInit, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {
    AlertController,
    IonButton,
    IonCol,
    IonContent,
    IonGrid,
    IonHeader,
    IonInput,
    IonItem,
    IonList,
    IonLoading,
    IonRow,
    IonText,
    IonTitle,
    IonToolbar
} from '@ionic/angular/standalone';
import {AuthService} from "./auth.service";
import {Router} from "@angular/router";
import {Observable, take} from "rxjs";
import {UserCredential} from "@angular/fire/auth";

@Component({
    selector: 'app-auth',
    templateUrl: './auth.page.html',
    styleUrls: ['./auth.page.scss'],
    standalone: true,
    imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, IonButton, IonLoading, IonGrid, IonRow, IonCol, IonList, IonItem, IonInput, FormsModule, ReactiveFormsModule, IonText]
})
export class AuthPage implements OnInit {

    @ViewChild('ionLoading') loadingElement!: IonLoading;

    loading: boolean = false;
    authForm!: FormGroup;
    isLogin!: boolean;

    constructor(private authService: AuthService,
                private router: Router,
                private formBuilder: FormBuilder,
                private alertController: AlertController) {
    }

    ngOnInit() {
        console.log('AuthPage ngOnInit');
        this.isLogin = true;
        this.authForm = this.formBuilder.group({
            email: ['', {
                validators: [Validators.required, Validators.email]
            }],
            password: ['', {
                validators: [Validators.required, Validators.minLength(6)]
            }],
            firstName: [''],
            lastName: ['']
        });
    }

    get email() {
        return this.authForm.get('email');
    }

    get password() {
        return this.authForm.get('password');
    }

    get firstName() {
        return this.authForm.get('firstName');
    }

    get lastName() {
        return this.authForm.get('lastName');
    }

    signIn(email: string, password: string) {
        this.loading = true;
        const authObservable = this.authService.login(email, password)
        this.authenticate(authObservable);
    }

    signUp(email: string, password: string, firstName: string, lastName: string) {
        this.loading = true;
        const authObservable = this.authService.signup(email, password, firstName, lastName);
        this.authenticate(authObservable);
    }

    authenticate(authObservable:Observable<UserCredential>) {
        authObservable.subscribe(
            {
                next: (response) => {
                    this.loading = false;
                    this.authForm.reset();
                    this.loadingElement.didDismiss.pipe(take(1)).subscribe(
                        () => this.openHomePage()
                    )
                },
                error: (error) => {
                    this.loading = false;

                    const failureReason = error.code;
                    let errorMessage = 'Could not sign in. Please try again.';
                    if (failureReason === 'auth/email-already-in-use') {
                        errorMessage = 'This email address is already in use.';
                    }
                    if (failureReason === 'auth/invalid-credential') {
                        errorMessage = 'Not a valid email or password.';
                    }
                    this.loadingElement.didDismiss.pipe(take(1)).subscribe(
                        () => this.showErrorAlert(errorMessage)
                    )
                }
            }
        )
    }

    openHomePage() {
        this.router.navigate(['/', 'places', 'tabs', 'discover']);
    }

    onSubmit(authForm: FormGroup) {
        if (authForm.invalid) {
            return;
        }
        const email = authForm.value.email;
        const password = authForm.value.password;
        const firstName = authForm.value.firstName;
        const lastName = authForm.value.lastName;
        if (firstName && lastName) {
            this.signUp(email, password, firstName, lastName);
            return;
        }
        this.signIn(email, password);
    }

    switchAuthMode() {
        this.isLogin = !this.isLogin;

        if (this.isLogin) {
            this.authForm.get('firstName')?.clearValidators();
            this.authForm.get('lastName')?.clearValidators();
        } else {
            this.authForm.get('firstName')?.setValidators([Validators.required]);
            this.authForm.get('lastName')?.setValidators([Validators.required]);
        }

        this.authForm.get('firstName')?.updateValueAndValidity();
        this.authForm.get('lastName')?.updateValueAndValidity();

        this.authForm.reset();
    }

    private showErrorAlert(message: string) {
        console.error('Showing error alert:', message);
        this.alertController.create({
            header: 'Authentication failed',
            message: message,
            buttons: [{
                text: 'Okay',
                role: 'destructive',
                handler: () => {
                    this.authForm.reset();
                }
            }]
        }).then(alert => {
            alert.present();
        })
    }
}
