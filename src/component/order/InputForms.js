import '../acceuil/Acceuil.css';
import { useState,useEffect } from 'react';
import { storageDB, realTimeDB } from '../modules/firebase';
import uuid from 'react-uuid';
import MediaQuery from 'react-responsive';
import emailjs from 'emailjs-com';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import Datetime from 'react-datetime';
import "react-datetime/css/react-datetime.css";
import TextareaAutosize from "react-textarea-autosize";
import Header from '../header/Header';
import { useSelector } from 'react-redux';



/////////////////////////////  ACCEUIL INPUT FORM ////////////////////////////////////////
export const InputForms = (props) => {
    const [uploadedImg, setUploadedImg] = useState('');
    const [clientEmail, setClientEmail] = useState('');
    const [clientPhone, setClientPhone] = useState();
    const [price, setPrice] = useState('');
    const [destinationEmail, setDestinationEmail] = useState('');
    const [destinationName, setDestinationName] = useState('');
    const [destinationPhone, setDestinationPhone] = useState();
    const [commadDetails, setCommandDetails] = useState('');
    const [uploadState, setUploadState] = useState(0);
    const [options, setOptions] = useState();
    const [date, setDate] = useState(new Date());
    // const [hiddenFormComponent, sethiddenFormComponent] = useState(false);

    const isHidden = useSelector((state) => state.hide);
    // console.log(isHidden);

    useEffect(() => {
        realTimeDB.ref('/offers').on('value', (snapshot) => {
            if (snapshot.exists()) {
                const offers = Object.values(snapshot.val())
                setOptions(offers);
                // console.log(options);
            }
        })
    },[])

    let storageRef = storageDB.ref('/preuve-de-payement').child(`/preuve-de-payement_${Date.now()}`);    
    const uploadProof = async (e) => {
            const file = e.target.files[0];
            storageRef.put(file).then((snapshot) => {
                setUploadState((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                snapshot.ref.getDownloadURL().then(url => {
                    // console.log(url);
                    setUploadedImg(url);
                })
            })
    }
// ////////////////////////// SEND COMMAND FROM USER TO BARAKASTORE ///////////////////////////////////
    const sendCommand = () => {
        const today = new Date();
        const commandID = uuid();
        realTimeDB.ref('/commades').child(commandID).set({
            id:`${commandID}`,
            clientEmail: `${clientEmail}`,
            clientPhone: `${clientPhone}`,
            price: `${price}`,
            destinationEmail: `${destinationEmail}`,
            destinationName: `${destinationName}`,
            destinationPhone: `${destinationPhone}`,
            commadDetails:`${commadDetails}`,
            payementProof: `${uploadedImg}`,
            date: `${today.toLocaleString()}`,
            livraryDate:`${date}`
        });
// ************************** SEND EMAIL TO ADMIN *****************************************//
        emailjs.send(`${process.env.REACT_APP_EMAILJS_SERVICE_ID}`, `template_ux9bik9`, {
            to: `barakastore.drc@gmail.com`,
            reply_to: `barakastore.drc@gmail.com`,
            client_email: `${clientEmail}`,
            client_phone: `${clientPhone}`,
            price: `${price}`,
            delivrary_date: `${date}`,
            date: `${today.toLocaleString()}`,
            destination_name: `${destinationName}`,
            destination_phone: `${destinationPhone}`,
            command_details: `${commadDetails}`,
            payement_proof:`${uploadedImg}`
        }, `${process.env.REACT_APP_EMAILJS_USER_ID}`);
// ************************** SEND EMAIL TO CLIENT *****************************************//
        emailjs.send(`${process.env.REACT_APP_EMAILJS_SERVICE_ID}`, `${process.env.REACT_APP_EMAILJS_VALIDATE_TEMPLETE_ID}`, {
            sujet: `Réception de la commande`,
            to: `${clientEmail}`,
            name: `${clientEmail.replace('@gmail.com','')}`,
            reply_to: `barakastore.drc@gmail.com`,
            message: `
                Votre commande a été envoyée avec succès, nous reviendrons vers vous dans peu.
            `
        }, `${process.env.REACT_APP_EMAILJS_USER_ID}`);
        //*************************** CLEAR INPUTS ******************************************* */ 
        setClientEmail('');
        setClientPhone();
        // setPrice('');
        setDestinationEmail('');
        setDestinationName('');
        setDestinationPhone();
        setCommandDetails('');
        setUploadedImg('');
        setUploadState('0');
        setDate(new Date());
        document.querySelector('.client-payement-proof').value = '';
        // console.log(today.toLocaleString())
    }
 

    return (
        <>
            <MediaQuery minWidth={300} maxWidth={1024}>
            <Header/>
            </MediaQuery>
            <div className='acceuil home-page-component'>
                <h3 className='welcome-h3'>Passez votre commande chez BarakaStore</h3>
                <div className='acceuil-client-form'>
                    <h4 className='client-title'>Client</h4>
                    <input className='client-form-mail' type='email' placeholder='Email' value={clientEmail} name='clientMail' onChange={(e) => { setClientEmail(e.target.value) }} />
                    {!isHidden && <PhoneInput international countryCallingCodeEditable={false} defaultCountry='CD' placeholder='phone' className='client-form-phone' value={clientPhone} name='clientPhone' onChange={setClientPhone} />}
                    <h5 className='select-title'>Veuillez choisir le bouquet</h5>
                    <select className='main-form-select-price' onChange={(e) => { setPrice(e.target.value) }}>
                        <option value=''>choisir le bouquet</option>
                        {
                            options !== undefined && options.map(({ id, price, quantity }) => {
                                return <option value={price} key={id}>{quantity} roses {price}$</option>
                            })
                        }
                    </select>
                    <h5 className='select-title'>Date et heure de livraison (48H minimum)</h5>
                    {!isHidden && <Datetime dateFormat={true} value={date} className='client-form-mail date-input' placeholder='Date' onChange={setDate} />}
                </div>
                <div className='acceuil-client-form'>
                    <h4 className='client-title'>Destination</h4>
                    {/* <img src={uploadedImg} alt='uploaded'/> */}
                    <input className='client-form-mail' type='email' placeholder='Email (optionel)' value={destinationEmail} name='destinationMail' onChange={(e) => { setDestinationEmail(e.target.value) }} />
                    <input className='client-form-name' type='text' placeholder='Nom' value={destinationName} name='destinationName' onChange={(e) => { setDestinationName(e.target.value) }} />
                    {!isHidden && <PhoneInput international countryCallingCodeEditable={false} defaultCountry='CD' placeholder='phone' className='client-form-phone' value={destinationPhone} name='destinationPhone' onChange={setDestinationPhone} />}
                    {!isHidden && <TextareaAutosize placeholder='Couleur de roses,Adresse du destinateur et autre préférences' className='client-text-textarea' value={commadDetails} name='commandDetails' onChange={(e) => { setCommandDetails(e.target.value) }} />}
                    <h5 className='select-title'>Preuve de paiyement     (<span>chargement: {uploadState}%</span>)</h5>
                    <input type='file' name='payementProof' className='client-payement-proof' onChange={uploadProof} />
                </div>
                <div className='submit-button-container'>
                    {
                        uploadState === 100 && uploadedImg !== '' && clientPhone.length >= 10 && clientEmail !== '' && destinationPhone.length >= 10 && commadDetails !== '' && price !== '' && <button className='submit-button' onClick={sendCommand}>ENVOYEZ</button>
                
                    }
                </div>
            </div>
        </>
    );
}

export default InputForms;