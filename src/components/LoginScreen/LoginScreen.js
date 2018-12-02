import React, { Component } from 'react';
import {
    View, 
    StyleSheet, 
    Text, 
    TouchableOpacity, 
    ImageBackground,
    Image,
    TextInput
} from 'react-native';
import {
    Spinner,
    Icon
} from 'native-base';
import * as Expo from 'expo';
import ENV from '../../constants/env';
import * as firebase from 'firebase';

firebase.initializeApp(ENV.firebaseConfig);

export default class LoginScreen extends Component {

    static navigationOptions = {
        header: null
    }

    constructor(props) {
        super(props);

        this.state = {
            isLoading: false, 
            fontLoaded: false,
            isEmailSignup: false ,
            isLogin: false,
            isEmailLogin: false,
            authError: false, 
            authErrorMessage: '',
            error: false, 
            errorMessage: '',
            email: '', 
            password: '', 
            confirmPassword: '', 
        }

        this.onGoogleButtonClicked = this.onGoogleButtonClicked.bind(this);
        this.validateEmail = this.validateEmail.bind(this);
        this.signupWithEmail = this.signupWithEmail.bind(this);
        this.loginWithEmail = this.loginWithEmail.bind(this);
    }

    async onGoogleButtonClicked() {
        try {
            const result = await Expo.Google.logInAsync({
                androidClientId: ENV.androidClientId,
                scopes: ['profile', 'email'],
            });

            if (result.type === 'success') {
                // verified
                console.log(JSON.stringify(result))
                return;
            } 
        } catch (e) {
            console.log(`error: ${JSON.stringify(e)}`)
            this.setState({
                error: true,
                errorMessage: e.toString()
            })
            return;
        }
    }

    validateEmail(email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    async loginWithEmail() {

        this.setState({
            isLoading: true
        })

        const { email, password } = this.state;
        const _email = email;
        const _password = password;

        // check for empty feilds
        if (email.length == 0 || password.length == 0) {
            this.setState({
                isLoading: false,
                authError: true,
                authErrorMessage: '*Empty feilds are not allowed!'
            });
            return;
        }
        if (password.length < 6) {
            this.setState({
                isLoading: false,
                authError: true,
                authErrorMessage: '*Password must have atleast 6 characters!'
            });
            return;
        }

        // validate email
        if (!this.validateEmail(email)) {
            this.setState({
                isLoading: false,
                authError: true,
                authErrorMessage: '*Invalid email address!'
            });
            return;
        }

        try {
            
            firebase
                .auth()
                .signInWithEmailAndPassword(email, password)
                .then(() => {
                    const response = firebase.auth().currentUser;
                    console.log(`response(firebase) ----> ${JSON.stringify(response)}`)
                    this.setState({
                        isLoading: false, 
                    });
                    return;
                })
                .catch((error) => {
                    console.log(`error(firebase) ----> ${error.toString()}`)
                    if (JSON.stringify(error).toLowerCase().includes('the password is invalid')) {
                        this.setState({
                            isLoading: false,
                            email: _email,
                            password: _password,
                            authError: true,
                            authErrorMessage: '*Password incorrect!'
                        })
                        return;
                    }
                    this.setState({
                        isLoading: false, 
                        error: true, 
                        errorMessage: error.toString()
                    })
                    return;
                })
            
        } catch(error) {
            console.log(`error outside firebase ----> ${error.toString()}`)
            this.setState({
                isLoading: false, 
                error: true, 
                errorMessage: error.toString()
            });
            return;
        }

    }

    async signupWithEmail() {

        this.setState({
            isLoading: true
        })

        const { email, password, confirmPassword } = this.state;

        // check if passwords match
        if(!(password === confirmPassword)) {
            this.setState({
                isLoading: false,
                authError: true,
                authErrorMessage: '*Passwords do not match!'
            })
            return;
        }

        // check for empty feilds
        if(email.length == 0 || password.length == 0) {
            this.setState({
                isLoading: false,
                authError: true,
                authErrorMessage: '*Empty feilds are not allowed!'
            });
            return;
        } 
        if(password.length < 6) {
            this.setState({
                isLoading: false,
                authError: true,
                authErrorMessage: '*Password must have atleast 6 characters!'
            });
            return;
        }

        // validate email
        if(!this.validateEmail(email)) {
            this.setState({
                isLoading: false,
                authError: true,
                authErrorMessage: '*Invalid email address!'
            });
            return;
        }

        try {
            firebase
                .auth()
                .createUserWithEmailAndPassword(this.state.email, this.state.password)
                .then(() => {
                    const response = firebase.auth().currentUser;
                    console.log(`response ----> ${JSON.stringify(response)}`)
                    this.setState({
                        isLoading: false, 
                        authError: false, 
                        error: false
                    })
                    return;
                })
                .catch((error) => {
                    console.log(`error ----> ${error.toString()}`)
                    if(error.toString().includes('The email address is already in use by another account')) {
                        this.setState({
                            isLoading: false, 
                            authError: true, 
                            authErrorMessage: '*Email already exists!'
                        });
                        return;
                    }
                    this.setState({
                        isLoading: false,
                        authError: false
                    })
                    return;
                })
        } catch(error) {
            console.log(`error outside firebase ----> ${error.toString()}`);
            return;
        }
    }

    render() {

        if(this.state.isLoading) {
            return (
                <ImageBackground
                    source={require("../../../assets/images/loginPageBackground.png")}
                    resizeMode="cover"
                    style={styles.generalContainer}>
                    <Spinner/>
                </ImageBackground>
            )
        }

        if(this.state.error) {
            return (
                <View style={styles.generalContainer}>
                    <Text>{this.state.errorMessage}</Text>
                </View>
            )
        }

        if(this.state.isLogin) {
            return (
                <ImageBackground
                    source={require("../../../assets/images/loginPageBackground.png")}
                    resizeMode="cover"
                    style={styles.mainContainer}>
                    <View style={styles.topContainer}>
                        <Image
                            resizeMode="contain"
                            source={require("../../../assets/images/w_logo.png")}
                            style={styles.logo} />
                        <Text style={styles.welcomeBackText}>Welcome Back!</Text>
                    </View>
                    <View style={styles.gap}></View>
                    <View style={styles.bottomContainer}>
                        <TouchableOpacity onPress={() => { this.onGoogleButtonClicked() }} style={styles.googleButton}>
                            <View style={styles.innerButton}>
                                <Image
                                    style={styles.signinIcon}
                                    source={require("../../../assets/images/google.png")} />
                                <Text style={styles.signupMessage}>Login with Google</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            onPress={() => {
                                this.setState({
                                    isEmailLogin: true, 
                                    isLogin: false, 
                                    authError: false, 
                                    error: false
                                })
                                return;
                            }}
                            style={styles.emailButton}>
                            <View style={styles.innerButton}>
                                <Image
                                    style={styles.signinIcon}
                                    source={require("../../../assets/images/email.png")} />
                                <Text style={styles.signupMessage}>Login with Email</Text>
                            </View>
                        </TouchableOpacity>
                        <Text style={styles.loginMessage}>Don't have an account?</Text>
                        <TouchableOpacity 
                            onPress={() => {
                                this.setState({
                                    isEmailLogin: false,
                                    isLogin: false,
                                    authError: false, 
                                    error: false
                                })
                                return;
                            }}
                            style={styles.loginButton}>
                            <Text style={styles.loginButtonLable}>Sign Up for free!</Text>
                        </TouchableOpacity>
                    </View>
                </ImageBackground>
            )
        }

        if(this.state.isEmailSignup) {
            return (
                <ImageBackground
                    source={require("../../../assets/images/loginPageBackground.png")}
                    resizeMode="cover"
                    style={styles.mainContainer}>
                    <View style={styles.backButtonContainer}>
                        <TouchableOpacity onPress={() => {
                            this.setState({
                                isEmailSignup: false
                            })
                        }}>
                            <Icon name="md-arrow-back" style={{fontSize: 34, marginLeft: 18, color: 'white'}}/>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.formContainer}>
                        <View style={styles.inputContainer}>
                            <Icon name="md-person" style={styles.formIcons} />
                            <TextInput onChangeText={(text) => {
                                this.setState({
                                    email: text
                                });
                            }} 
                            style={styles.input} 
                            placeholder="email" 
                            keyboardType="email-address" 
                            autoCapitalize="none"/>
                        </View>
                        <View style={styles.inputContainer}>
                            <Icon name="md-lock" style={styles.formIcons} />
                            <TextInput onChangeText={(text) => {
                                this.setState({
                                    password: text
                                });
                            }} 
                            style={styles.input} 
                            placeholder="password" 
                            secureTextEntry={true}/>
                        </View>
                        <View style={styles.inputContainer}>
                            <Icon name="md-lock" style={styles.formIcons} />
                            <TextInput onChangeText={(text) => {
                                this.setState({
                                    confirmPassword: text
                                })
                            }} 
                            style={styles.input} 
                            placeholder="confirm password" 
                            secureTextEntry={true}/>
                        </View>
                        {this.state.authError ? <Text style={styles.authErrorText}>{this.state.authErrorMessage}</Text> : <View style={{height: 38}} />}
                        <TouchableOpacity 
                            onPress={() => {
                                this.signupWithEmail()
                            }} 
                            style={styles.signUpButton}>
                            <Text style={styles.signUpText}>
                                Sign Up
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ImageBackground>
            )
        }

        if(this.state.isEmailLogin) {
            return (
                <ImageBackground
                    source={require("../../../assets/images/loginPageBackground.png")}
                    resizeMode="cover"
                    style={styles.mainContainer}>
                    <View style={styles.backButtonContainer}>
                        <TouchableOpacity onPress={() => {
                            this.setState({
                                isEmailLogin: false,
                                isLogin: true
                            })
                        }}>
                            <Icon name="md-arrow-back" style={{fontSize: 34, marginLeft: 18, color: 'white'}}/>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.formContainer}>
                        {/* <TextInput placeholder="email" autoCapitalize="none" keyboardType="email-address" style={styles.input}/>
                        <TextInput placeholder="password" secureTextEntry={true} style={styles.input}/> */}
                        <View style={styles.inputContainer}>
                            <Icon name="md-person" style={styles.formIcons} />
                            <TextInput 
                                onChangeText={(text) => {
                                    this.setState({
                                        email: text
                                    });
                                }} 
                                style={styles.input} 
                                placeholder="email" 
                                keyboardType="email-address" 
                                autoCapitalize="none">{this.state.email}</TextInput>
                        </View>
                        <View style={styles.inputContainer}>
                            <Icon name="md-lock" style={styles.formIcons} />
                            <TextInput 
                                onChangeText={(text) => {
                                    this.setState({
                                        password: text
                                    });
                                }} 
                                style={styles.input} 
                                placeholder="password" 
                                secureTextEntry={true}>{this.state.password}</TextInput>
                        </View>
                        {this.state.authError ? <Text style={styles.authErrorText}>{this.state.authErrorMessage}</Text> : <View style={{height: 38}} />}
                        <TouchableOpacity 
                            onPress={() => {
                                this.loginWithEmail()
                            }} 
                            style={styles.signUpButton}>
                            <Text style={styles.signUpText}>
                                Login
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ImageBackground>
            )
        }

        return (
            <ImageBackground 
                source={require("../../../assets/images/loginPageBackground.png")} 
                resizeMode="cover"
                style={styles.mainContainer}>
                <View style={styles.topContainer}>
                    <Image 
                        resizeMode="contain"
                        source={require("../../../assets/images/w_logo.png")} 
                        style={styles.logo}/>
                </View>
                <View style={styles.gap}></View>
                <View style={styles.bottomContainer}>
                    <TouchableOpacity onPress={() => {this.onGoogleButtonClicked()}} style={styles.googleButton}>
                        <View style={styles.innerButton}>
                            <Image 
                                style={styles.signinIcon}
                                source={require("../../../assets/images/google.png")}/>
                            <Text style={styles.signupMessage}>Sign Up with Google</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => {
                        this.setState({
                            isEmailSignup: true
                        })
                    }} 
                    style={styles.emailButton}>
                        <View style={styles.innerButton}>
                            <Image 
                                style={styles.signinIcon}
                                source={require("../../../assets/images/email.png")}/>
                            <Text style={styles.signupMessage}>Sign Up with Email</Text>
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.loginMessage}>Already a user?</Text>
                    <TouchableOpacity 
                        onPress={() => {
                            this.setState({
                                isLogin: true
                            });
                        }} 
                        style={styles.loginButton}>
                        <Text style={styles.loginButtonLable}>LOG IN</Text>
                    </TouchableOpacity>
                </View>
            </ImageBackground>
        )
    }
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1, 
        width: '100%', 
        height: '100%',
    },
    generalContainer: {
        flex: 1, 
        width: '100%', 
        height: '100%', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#ffffff'
    },
    topContainer: {
        height: '35%', 
        backgroundColor: 'transparent', 
        width: '100%',
        alignItems: 'center', 
        justifyContent: 'center',
    },
    gap: {
        height: '20%', 
        width: '100%'
    },
    bottomContainer: {
        height: '45%', 
        width: '100%', 
        alignItems: 'center', 
        justifyContent: 'center',
    },
    innerButton: {
        height: '100%', 
        width: '100%', 
        flexDirection: 'row',
        alignItems: 'center', 
        padding: 4,
        backgroundColor: 'transparent'
    },
    backButtonContainer: {
        height: 66, 
        alignItems: 'flex-start', 
        justifyContent: 'center',
        width: '100%', 
        backgroundColor: 'transparent', 
    },
    formContainer: {
        height: '92.5%', 
        width: '100%', 
        alignItems: 'center', 
        backgroundColor: "transparent", 
        padding: 14
    },
    inputContainer: {
        width: '100%', 
        height: 55, 
        flexDirection: 'row', 
        alignItems: 'center', 
        padding: 14,
        borderRadius: 50, 
        marginTop: 15, 
        backgroundColor: '#00838b'
    },

    // images
    logo: {
        height: 175, 
        width: 175, 
    },
    signinIcon: {
        height: 27.5, 
        width: 27.5, 
        margin: 12
    },
    backButtonImage: {
        height: 32, 
        width: 32,
        marginLeft: 18
    }, 

    // icons
    formIcons: {
        fontSize: 34, 
        marginLeft: 18, 
        color: 'white'
    },

    // texts
    loginMessage: {
        textAlign: 'center', 
        color: 'white',
        fontWeight: 'bold',
        fontSize: 22, 
        marginTop: 24
    },
    signupMessage: {
        textAlign: 'left', 
        fontSize: 22,
        color: "#fff",
        margin: 12
    },
    loginButtonLable: {
        fontWeight: 'bold',
        fontSize: 20, 
        color: '#000', 
    },
    signUpText: {
        color: "#fff", 
        fontSize: 22,
        textAlign: 'center', 
        margin: 14
    },
    authErrorText: {
        color: '#ffffff', 
        marginTop: 38,
        fontSize: 22
    },
    welcomeBackText: {
        color: '#ffffff', 
        fontSize: 22,
        fontWeight: 'bold', 
        marginTop: 14, 
        textAlign: 'center'
    },


    // buttons
    googleButton: {
        width: '77.5%', 
        height: '15%', 
        backgroundColor: '#00ad97',
        alignItems: 'center', 
        justifyContent: 'center',
        borderRadius: 50,
        marginBottom: 12
    },
    emailButton: {
        width: '77.5%', 
        height: '15%', 
        backgroundColor: '#00838b',
        alignItems: 'center', 
        justifyContent: 'center',
        borderRadius: 50,
        marginBottom: 12
    },
    loginButton: {
        width: '77.5%', 
        height: '15%', 
        backgroundColor: '#ffffff',
        alignItems: 'center', 
        justifyContent: 'center',
        borderRadius: 50,
        marginTop: 12
    },
    signUpButton: {
        width: '100%',
        height: 55, 
        borderRadius: 50, 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#00ad97',
        marginTop: 8,
    },


    // form 
    input: {
        width: '77.5%',
        height: '100%',
        fontSize: 20,
        color: '#ffffff', 
        marginLeft: 24
    }
});