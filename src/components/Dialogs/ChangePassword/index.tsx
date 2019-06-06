import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import LinearProgress from '@material-ui/core/LinearProgress';
import Slide from '@material-ui/core/Slide';
import FormValidation from '@react-form-fields/material-ui/components/FormValidation';
import FieldText from '@react-form-fields/material-ui/components/Text';
import { FormComponent, IStateForm } from 'components/Abstract/Form';
import Snackbar from 'components/Shared/Snackbar';
import { WithStyles } from 'decorators/withStyles';
import * as React from 'react';
import rxjsOperators from 'rxjs-operators';
import authService from 'services/auth';

interface IState extends IStateForm<{
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}> {
  opened: boolean;
  loading: boolean;
}

interface IProps {
  classes?: any;
}

@WithStyles({
  content: {
    width: 400,
    maxWidth: 'calc(95vw - 50px)'
  }
})
export default class ChangePasswordDialog extends FormComponent<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = { ...this.state, opened: false, loading: false };
  }

  componentDidMount() {
    authService.shouldOpenChangePassword().pipe(
      rxjsOperators.logError(),
      rxjsOperators.bindComponent(this)
    ).subscribe(opened => {
      this.setState({ opened });
    });
  }

  onCancel = () => {
    authService.closeChangePassword();
  }

  onSubmit = async (isValid: boolean) => {
    const { model } = this.state;
    if (!isValid) return;

    this.setState({ loading: true });

    authService.changePassword(model.currentPassword, model.newPassword).pipe(
      rxjsOperators.logError(),
      rxjsOperators.bindComponent(this)
    ).subscribe(() => {
      this.setState({ loading: false });

      Snackbar.show('Senha alterada com sucesso!');
      authService.closeChangePassword();
    }, err => {
      Snackbar.error(err);
      this.setState({ loading: false });
    });
  }

  render() {
    const { opened, loading, model } = this.state;
    const { classes } = this.props;

    return (
      <Dialog
        disableBackdropClick
        disableEscapeKeyDown
        open={opened}
        onExited={this.resetForm}
        TransitionComponent={Transition}>

        {loading && <LinearProgress color='secondary' />}

        <FormValidation onSubmit={this.onSubmit}>
          <DialogTitle>Trocar Senha</DialogTitle>

          <DialogContent className={classes.content}>
            <FieldText
              label='Senha Atual'
              type='password'
              disabled={loading}
              value={model.currentPassword}
              validation='required'
              onChange={this.updateModel((model, v) => model.currentPassword = v)}
            />

            <FieldText
              label='Nova senha'
              type='password'
              disabled={loading}
              value={model.newPassword}
              validation='required|min:5'
              onChange={this.updateModel((model, v) => model.newPassword = v)}
            />

            <FieldText
              label='Repita a senha'
              type='password'
              disabled={loading}
              value={model.confirmPassword}
              validation='required|same:nova senha'
              validationContext={{ 'nova senha': model.newPassword }}
              onChange={this.updateModel((model, v) => model.confirmPassword = v)}
            />
          </DialogContent>

          <DialogActions>
            <Button disabled={loading} onClick={this.onCancel}>Cancelar</Button>
            <Button color='secondary' type='submit' disabled={loading}>Salvar</Button>
          </DialogActions>

        </FormValidation>
      </Dialog>
    );
  }
}

function Transition(props: any) {
  return <Slide direction='up' {...props} />;
}