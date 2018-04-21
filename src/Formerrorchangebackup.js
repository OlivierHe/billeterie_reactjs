import React from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import DatePicker from 'material-ui/DatePicker';
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


class CoordFields extends React.Component{
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.state = {error : ""};
  }

  
  handleChange(event) {
    //const validation = (event.target.type === "text") ? 'type text' : 'type email' ;
    //console.log(validation);
    this.validation(event);

    this.props.inpChange(event.target.name, event.target.value);
  }

  validation(event){
    const type = event.target.type;
    const value = event.target.value;
    const name = event.target.name;
    if (type === "text") {
      if ((value.length < 2) || (value.length > 100)) { 
        this.setState({error : {[name] : "Il faut 2 caractères minimum et 100 maximum"}});
      } else { 
        this.setState({error: {[name] : ""});
      }
    } else {
       console.log(type);
    }
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
    this.props.coordRestore();
  }

  render() {
    console.log(this.state);
    return(
      <div>
      <fieldset>
      <legend> Billet n°{this.props.idBillet} </legend>
        <fieldset>
        <legend>Coordonnées :</legend>
        <TextField floatingLabelText="Nom" type="text" name={this.props.nName} errorText={this.state.error[this.props.nName]} autoComplete="family-name" value={this.props.nom}  onChange={this.handleChange} />
        <br/>
        <TextField floatingLabelText="Prénom" type="text" name={this.props.pName}  errorText={this.state.error[this.props.pName]} autoComplete="given-name" value={this.props.prenom}  onChange={this.handleChange}/>
        <br/>
        <TextField floatingLabelText="Courriel" type="email" name={this.props.cName}  errorText={this.state.error[this.props.cName]} autoComplete="email" value={this.props.courriel}  onChange={this.handleChange}/>
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
            value={this.props.dateNaissance} 
            maxDate={maxDate}
            autoOk={true} 
            openToYearSelection={true}  
            DateTimeFormat={DateTimeFormat}
            okLabel="OK"
            cancelLabel="Annuler"
            locale="fr"
            onChange={(e, date) => this.props.dateBirthChange(e, date, this.props.dnName)}
        />
    
        </fieldset>
        <fieldset>
        <legend>Réservation de billet :</legend>
        <DatePicker 
            floatingLabelText="Jour de la visite" 
            value={this.props.dateVisite} 
            DateTimeFormat={DateTimeFormat}
            minDate={maxDate}
            shouldDisableDate={this.disableWeekends}
            okLabel="OK"
            cancelLabel="Annuler"
            locale="fr"
            onChange={(e, date) => this.props.dateVisitChange(e, date, this.props.dvName)}
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
      </fieldset>
    </fieldset>
      </div>
    );
  }
}


class Form extends React.Component {
  constructor(props) {
    super(props);
    this.mofo = {};
    this.state = {
      qtyBillets: "0",
      isGoing: true,
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleRestore = this.handleRestore.bind(this);
    this.handleBackup = this.handleBackup.bind(this);
    this.handleQtyReset = this.handleQtyReset.bind(this);
    this.handleDelBillet = this.handleDelBillet.bind(this);
    this.handleSelectChange = this.handleSelectChange.bind(this);
    this.handleQtyChange = this.handleQtyChange.bind(this);
    this.handleChangeDateBirth = this.handleChangeDateBirth.bind(this);
    this.handleChangeDateVisit = this.handleChangeDateVisit.bind(this);
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
    };
  }

  fillStartValue(billet){
    return {
      ['prenom' + billet] : "",
      ['nom' + billet] : "",
      ['courriel' + billet] : "",
      ['pays' + billet] : "france",
      ['type_billet' + billet] : "journee",
    };
  }


  handleInputChange(iNam, iVal) {
    this.setState({
      [iNam]: iVal,
    });
  }
  

  handleBackup(){
    console.log("stock le prev state dans le backup");
    //this.setState({['viewCoord' + (this.state.qtyBillets -1).toString()] : true});
    //this.setState({viewCoord0 : true});
   /* this.setState((prevState, props) => {
      return this.mofo = prevState;
    }); */
  }

  handleRestore(){
    console.log('dans restore');
    //Object.assign(this.mofo, {qtyBillets : (this.mofo.qtyBillets -1).toString(), test: "roulious", nom0:undefined});

    const qtyBillets = this.state.qtyBillets;
    this.setState(this.clearTicket(qtyBillets));

    // permet de supprimer définitivement les attribut undefined sinon il sont toujours présents
    this.setState({});
    //console.log(this.mofo);
    //this.setState(this.mofo); 
    //console.log(this.state);
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

   handleChangeDateBirth(e, value, name){
      this.setState({
      [name] : value,
    });
  }

  handleChangeDateVisit(e, value, name){
      this.setState({
      [name] : value,
    });
  }

  handleDelBillet(e) {
    e.preventDefault();
    const idBillet = e.currentTarget.getAttribute('idbillet');
    this.setState(this.clearTicket(idBillet));
    this.setState({});
  }


 handleQtyChange(iNam, iVal) {
    this.setState({
      [iNam]: iVal,
      ['viewCoord' + this.state.qtyBillets]: true,
    });
    this.setState(this.fillStartValue(this.state.qtyBillets));
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
                     inpChange={this.handleInputChange}
                     selectChange={this.handleSelectChange}
                     dateBirthChange={this.handleChangeDateBirth}
                     dateVisitChange={this.handleChangeDateVisit}
                     coordBackup={this.handleBackup}
                     coordRestore={this.handleRestore}/>            
        <button  idbillet={i} onClick={this.handleDelBillet}>Supprimer billet {i + 1}</button>
        </div>
                     ) : (
                      <p key={i}>billet {i + 1}  supprimé</p>
                     )
      );
    }

    return (
      <form>
    {/* dans la value on affiche la valeur de state = controlled component*/}
          <QtyBillets value={this.state.qtyBillets} onValChange={this.handleQtyChange}/>
          <div>{forms}</div>
          <RaisedButton label="Redémarrer réservation" secondary={true} style={style} onClick={this.handleQtyReset}/>
      </form>
    );
  }
}

export default Form;
