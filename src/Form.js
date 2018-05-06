import React from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import DatePicker from 'material-ui/DatePicker';
import Checkbox from 'material-ui/Checkbox';
import Snackbar from 'material-ui/Snackbar';
import Paper from 'material-ui/Paper';
import StripeCheckout from 'react-stripe-checkout';
import areIntlLocalesSupported from 'intl-locales-supported';
import './App.css';

let DateTimeFormat;

/**
 * Use the native Intl.DateTimeFormat if available, or a polyfill if not.
 */
if (areIntlLocalesSupported(['fr', 'fa-IR'])) {
  DateTimeFormat = global.Intl.DateTimeFormat;
} else {
  const IntlPolyfill = require('intl');
  DateTimeFormat = IntlPolyfill.DateTimeFormat;
  require('intl/locale-data/jsonp/fr');
  require('intl/locale-data/jsonp/fa-IR');
}

const maxDate = new Date(Date.now());
var back = false;

class QtyBillets extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
     this.props.onValChange(event.target.name, event.target.value);
  }

  render (){
    return (      
       <TextField floatingLabelText="Quantité de billets" type="number" name="qtyBillets" value={this.props.value} onChange={this.handleChange}/>
    );
  }
}


class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(error, info) {
    // Display fallback UI
    this.setState({ hasError: true});
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <h1>Erreur du module de payement</h1>;
    }
    return this.props.children;
  }
}


class CoordFields extends React.Component{
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.state = {error : ""};
  }
 
  handleChange(event) {
    this.props.inpChange(event.target.name, event.target.value, event.target.type);
  }

  disableWeekends(date) {
   /* date interdites
    01/01
    01/05
    08/08
    14/07
    15/08
    01/11
    11/11
    25/12 
    */
    const dateInterditesRaw = [
      new Date(date.getFullYear(),0,1),
      new Date(date.getFullYear(),4,1),
      new Date(date.getFullYear(),7,8),
      new Date(date.getFullYear(),6,14),
      new Date(date.getFullYear(),7,15),
      new Date(date.getFullYear(),10,1),
      new Date(date.getFullYear(),10,11),
      new Date(date.getFullYear(),11,25),
    ];
    
    const dateInterdites = dateInterditesRaw.map((arrVal) => {return arrVal.getTime()});

    return date.getDay() === 0 || dateInterdites.includes(date.getTime());
  }

  componentWillMount() {
    this.props.coordBackup();
  }

  componentWillUnmount() {
    this.props.coordRestore(this.props.idRaw);
  }

  render() {
    return(
      <div>
      <fieldset>
      <legend> Billet n°{this.props.idBillet} </legend>
        <fieldset>
          <legend>Coordonnées :</legend>
          <TextField floatingLabelText="Nom" type="text" name={this.props.nName} errorText={this.props.errorState[this.props.nName]} autoComplete="family-name" value={this.props.nom}  onChange={this.handleChange} />
          <br/>
          <TextField floatingLabelText="Prénom" type="text" name={this.props.pName}  errorText={this.props.errorState[this.props.pName]} autoComplete="given-name" value={this.props.prenom}  onChange={this.handleChange}/>
          <br/>
          <TextField floatingLabelText="Courriel" type="email" name={this.props.cName}  errorText={this.props.errorState[this.props.cName]} autoComplete="email" value={this.props.courriel}  onChange={this.handleChange}/>
          <br/>
          <SelectField
              floatingLabelText="Pays"
              value={this.props.pays}
              autoWidth={true}
              onChange={(e, index, value) => this.props.selectChange(e, index, value, this.props.paName)}
          >
              <MenuItem value={"france"} primaryText="France"/>
              <MenuItem value={"angleterre"} primaryText="England" />
              <MenuItem value={"us"} primaryText="United States" />
              <MenuItem value={"belgique"} primaryText="Belgique" />
          </SelectField>
          <br />
          <DatePicker 
              floatingLabelText="Date de naissance"
              errorText={this.props.errorState[this.props.dnName]}
              value={this.props.dateNaissance} 
              maxDate={maxDate}
              autoOk={true} 
              openToYearSelection={true}  
              DateTimeFormat={DateTimeFormat}
              okLabel="OK"
              cancelLabel="Annuler"
              locale="fr"
              onChange={(e, date) => this.props.dateChange(e, date, this.props.dnName, "dNaissance", this.props.idRaw)}
          />
    
        </fieldset>
        <fieldset>
        <legend>Réservation de billet :</legend>
          <DatePicker 
              floatingLabelText="Jour de la visite"
              errorText={this.props.errorState[this.props.dvName]} 
              value={this.props.dateVisite} 
              DateTimeFormat={DateTimeFormat}
              minDate={maxDate}
              shouldDisableDate={this.disableWeekends}
              okLabel="OK"
              cancelLabel="Annuler"
              locale="fr"
              onChange={(e, date) => this.props.dateChange(e, date, this.props.dvName, "dVisite")}
          />

          <SelectField
              floatingLabelText="Type de billet"
              value={this.props.typeBillet}
              autoWidth={true}
              onChange={(e, index, value) => this.props.selectChange(e, index, value, this.props.tbName)}
          >
              <MenuItem value={"journee"} primaryText="Journée"/>
              <MenuItem value={"demi-journee"} primaryText="Demi-journée" />
          </SelectField>
          <Checkbox
            label="cocher si tarif réduit"
            name={this.props.trName}
            checked={this.props.tarifReduit}
            onCheck={() => this.props.checkBoxChange(this.props.trName, this.props.idRaw)}
          />
      </fieldset>
    </fieldset>
      </div>
    );
  }
}

class Form extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      qtyBillets: "0",
      error: {},
      total: {},
      isError: false,
      payed: false,
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleRestore = this.handleRestore.bind(this);
    this.handleBackup = this.handleBackup.bind(this);
    this.handleQtyReset = this.handleQtyReset.bind(this);
    this.handleDelBillet = this.handleDelBillet.bind(this);
    this.handleSelectChange = this.handleSelectChange.bind(this);
    this.handleQtyChange = this.handleQtyChange.bind(this);
    this.handleChangeDate = this.handleChangeDate.bind(this);
    this.handleCheckBoxChange = this.handleCheckBoxChange.bind(this);
    this.handleResa = this.handleResa.bind(this);
  }

  clearTicket(billet){
    return {
      ['viewCoord' + billet] : false,
      ['prenom' + billet] : undefined,
      ['nom' + billet] : undefined,
      ['courriel' + billet] : undefined,
      ['pays' + billet] : undefined,
      ['date_naissance' + billet] : undefined,
      ['date_visite' + billet] : undefined,
      ['type_billet' + billet] : undefined,
      ['tarif_reduit' + billet] : undefined,
      error : { ...this.state.error,     
        ['prenom' + billet] : undefined,
        ['nom' + billet] : undefined,
        ['courriel' + billet] : undefined,
        ['date_naissance' + billet] : undefined,
        ['date_visite' + billet] : undefined,
        ['tarif_reduit' + billet] : undefined,
      },
      total : { ...this.state.total,
        ['billet' + billet] : undefined,
      },
    };
  }

  fillStartValue(billet){
    return {
      ['prenom' + billet] : "",
      ['nom' + billet] : "",
      ['courriel' + billet] : "",
      ['pays' + billet] : "france",
      ['date_naissance' + billet] : {},
      ['date_visite' + billet] : {},
      ['type_billet' + billet] : "journee",
      ['tarif_reduit' + billet] : false,
    };
  }


  handleInputChange(iNam, iVal, iType) {
    this.validation(iNam, iVal, iType);
    this.setState({
      [iNam]: iVal,
    });
  }


  validation(name, value, type){
    if (type === "text") {
      if ((value.length < 2) || (value.length > 100)) { 
        this.setState(prevState => ({
        error: {
          ...prevState.error,
          [name] : "Il faut 2 caractères minimum et 100 maximum",
          }
        }));
      } else { 
        this.clearError(name);
      }
    } else {
       const regex = /^(([^<>()[\].,;:\s@"]+(.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}])|(([a-zA-Z\-0-9]+.)+[a-zA-Z]{2,}))$/;
       if (regex.test(value)) {
          this.clearError(name);
       }else {
          this.setState(prevState => ({
          error: {
            ...prevState.error,
            [name] : "le courriel est éronné",
            }
          }));
       }
    }
  }

  clearError(name){
    this.setState(prevState => ({
    error: {
      ...prevState.error,
      [name] : "",
      },
    }));
  }
  

  handleBackup(){
    back = false;
  }

  handleRestore(idBillet){
    // permet garder les tickets quand on valide la resa
    // dans le cas contraire de les supprimers par différentes actions 
    if(!back) {
      this.setState(this.clearTicket(idBillet), this.setState({}));
    }
    this.showResa();

  }

  handleQtyReset(e) {
    e.preventDefault();
    this.setState({qtyBillets: "0"});
  }

  handleSelectChange(e, index, value, name){
      this.setState({
      [name] : value,
    });
  }

   handleChangeDate(e, value, name, type, idRaw){
      this.setState({
      [name] : value,
    });
    this.clearError(name);

    if (type === "dNaissance") {
      // décoche la box de tarif réduit et lance le calcul
      this.setState({["tarif_reduit" + idRaw] : false});
      this.priceManager(value, idRaw);
       
       
    }
  }

  priceManager(value, idRaw){
      var price = this.priceCalc(this.ageCalc(value));
      console.log(this.priceCalc(this.ageCalc(value)));
      this.setState((prevState) => {
        return {total: { 
                      ...prevState.total,
                      ["billet" + idRaw] : price,
                    }
               };
      }); 
  }

  ageCalc(birthday) {
    const todayMonth = maxDate.getMonth(), 
          birthMonth = birthday.getMonth(),
          todayDate = maxDate.getDate(),
          bDate = birthday.getDate();

    var age = maxDate.getFullYear() - birthday.getFullYear();
    if (  todayMonth >= birthMonth) {
        if ( todayDate >= bDate) {
            return age;
        }
    }
    age = age - 1;
    return age;
  }

  priceCalc(age) {
    switch (true){
        case age < 4:
          return 0; 
        case age >= 4 && age < 12:
          return 8;
        case age >= 12 && age < 60:
          return 16;
        case age >= 60:
          return 12;
        default:
          return 0;
    }
  }

  showResa() {
   
      for (let i = 0; i < this.state.qtyBillets ; i++) {
         if(this.state["viewCoord" + i]) { 
          return true;
        }
      }
    
    this.setState({qtyBillets: "0"});
  }
  


  handleCheckBoxChange(name, idRaw) {
    if(this.state.total["billet" + idRaw] !== undefined) {
         this.setState((prevState) => {
          return {
          [name] : !prevState[name],
        };
      });
      if (!this.state[name] && this.state.total["billet" + idRaw] > 10) {
            //dans la verif du prix
            this.setState({total : { 
                          ...this.state.total,
                          ["billet" + idRaw] : 10,
                          }
            });
      } else {
      // recalcule l'ancien prix si tarif réduit décoché
      this.priceManager(this.state["date_naissance" + idRaw], idRaw);
      }
    }else {
      this.setState((prevState) => {
          return {error: { 
                  ...prevState.error,
                  ["date_naissance" + idRaw] : "vous devez d'abord choisir la date de naissance et le prix du billet doit être à plus de 10 euros",
                }
           };
      }); 
    }
 }

  handleDelBillet(e) {
    e.preventDefault();
    const idBillet = e.currentTarget.getAttribute('idbillet');
    this.setState({['viewCoord' + idBillet] : false});
  }


 handleQtyChange(iNam, iVal) {
   if (iVal < 0) {
      return; 
   }else{
      this.setState({
        [iNam]: iVal,
        ['viewCoord' + this.state.qtyBillets]: true,
      });
      if (iVal < this.state.qtyBillets) { 
        // si la quantité est réduite on supprime le billet sans remplissage de valeur début
        this.setState(this.clearTicket(this.state.qtyBillets), this.setState({}));
        return;
      }
      this.setState(this.fillStartValue(this.state.qtyBillets));
    };
  } 

  handleResa(){
    this.setState({isError: false});
    Object.entries(this.state).forEach(([cle, valeur]) => {
      if (cle !=="total" && cle !=="error" && valeur !== undefined && (valeur === "" || (valeur.constructor === Object && Object.keys(valeur).length === 0))) {
            // callback sur methode showprice dans une function arrow sinon résultat faux
            this.setState(prevState => {
              return {
                error: {
                  ...prevState.error,
                  [cle] : "Le champ doit être rempli",
                  },
                  isError: true
              };
            });
      } else {
        if (cle === "total" && Object.keys(valeur).length !== 0) {
          var addition = 0;
          for (let inTotal in valeur) {
              if (valeur[inTotal] !== undefined) {
                  addition = addition + valeur[inTotal];
            }
          }
          console.log("dans total addition " + addition);
          this.setState({ totalAdd : addition });
          back = true;
        }
      }
    });
  }

  showPrice(back) {
    // permet de revenir en arrière après la resa en cas d'erreur
    if (back) {
      this.setState({isError: true});
      back = true;
    }
  }

  closeStripeView(){
    return (
      <Paper zDepth={2}>
        Merci de votre visite vous recevrez un mail prochainement !
      </Paper>
    );
  }

  payView(style) {
    const paperStyle ={
      margin: 20,
      padding: 20,
      textAlign: 'center',
      display: 'inline-block',
    };

 
  if (this.state.totalAdd === 0 ) { this.setState({payed : true })};

   const onToken = (token) => {
    // doit être stocké coté en serveur pour la gestion des charges
      token.amount = this.state.totalAdd * 100;
      token.currency= 'EUR';
      fetch('/charge', {
        method: 'POST',
        body: JSON.stringify(token)
      }).then(response => {
          this.setState({payed : true });
          response.status === 200 ? (console.log("aucun problèmes")) : ( console.log("problèmes"));
         });
      }

  
    
    return (
      <div>
      {!this.state.payed ? (
          <Paper zDepth={2} style={paperStyle}>
          <p>Il vous reste à regler {this.state.totalAdd} euros</p> 
          <ErrorBoundary>
            <StripeCheckout
              name="Billeterie du Louvre" 
              amount={this.state.totalAdd * 100} // cents
              currency="EUR"
              locale="fr"
              label="Payer"
              style={{ background: '#a4c639', borderRadius: 'unset'}} 
              textStyle= {{background: '#a4c639', borderRadius: 'unset', backgroundImage: 'none'}}
              touchRipple={true}
              token={onToken}
              stripeKey="pk_test_F6QKIb7chPWGBRdRXawkyWtY"
            />
          </ErrorBoundary>
          <RaisedButton label="Revenir en arrière" secondary={true} style={style} onClick={() => this.showPrice(true)}/>
          </Paper>
        ) : (
          this.closeStripeView()
        )
      }
      </div>
    );
  }

  render() {
    const style = {
      margin: 12,
    };
    console.log(this.state); 
    const forms = [];
    for(let i = 0; i < this.state.qtyBillets; i++) {
      forms.push( this.state["viewCoord" + i] ? (
        <div key={i}>
        <CoordFields 
                     idRaw = {i}
                     idBillet={i + 1}
                     nName={"nom" + i}
                     nom={this.state["nom" + i]}
                     pName={"prenom" + i} 
                     prenom={this.state["prenom" + i]}
                     cName={"courriel" + i} 
                     courriel={this.state["courriel" + i]}
                     paName={"pays" + i} 
                     pays={this.state["pays" + i]}
                     dnName={"date_naissance" + i} 
                     dateNaissance={this.state["date_naissance" + i]}
                     dvName={"date_visite" + i} 
                     dateVisite={this.state["date_visite" + i]}  
                     tbName={"type_billet" + i} 
                     typeBillet={this.state["type_billet" + i]}
                     trName={"tarif_reduit" + i} 
                     tarifReduit={this.state["tarif_reduit" + i]}
                     errorState ={this.state.error} 
                     inpChange={this.handleInputChange}
                     selectChange={this.handleSelectChange}
                     dateChange={this.handleChangeDate}
                     checkBoxChange = {this.handleCheckBoxChange}
                     coordBackup={this.handleBackup}
                     coordRestore={this.handleRestore}/>            
        <RaisedButton idbillet={i} secondary={true} label={"Supprimer billet " +  (i + 1)}  style={style} onClick={this.handleDelBillet}/>
        </div>
                     ) : (
                             <Snackbar
                              key={i}
                              open={true}
                              bodyStyle={{ backgroundColor: 'coral', color: 'white' }} 
                              message={"BILLET "+ (i + 1) + " SUPPRIMÉ"}
                              autoHideDuration={2000}
                              onRequestClose={this.handleRequestClose}
                            />
                     )
      );
    }

    return (
      <div>
      { !this.state.isError && this.state.totalAdd !== undefined ? (
         this.payView(style)
       ) : (    
      <form>
    
          <QtyBillets value={this.state.qtyBillets} onValChange={this.handleQtyChange}/>
          <div>{forms}</div>
          {this.state.qtyBillets > 0 ? 
            (<div>
                <RaisedButton label="Réserver" backgroundColor="#a4c639" labelColor="#ffffff" style={style} onClick={this.handleResa}/>
                <RaisedButton label="Redémarrer réservation" secondary={true} style={style} onClick={this.handleQtyReset}/>
            </div>):("")
          } 
       
      </form>
      
      )} 
      </div>
    );
  }
}

export default Form;
