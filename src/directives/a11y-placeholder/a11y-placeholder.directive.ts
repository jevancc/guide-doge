import { Compiler, ComponentFactoryResolver, ComponentRef, Directive, Injector, Type, ViewContainerRef } from '@angular/core';
import { Preference } from '../../services/preference/types';
import { LazyA11yModule } from './types';

@Directive({
  selector: '[appA11yPlaceholder]',
})
export class A11yPlaceholderDirective<Host> {
  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private viewContainerRef: ViewContainerRef,
    private compiler: Compiler,
    private injector: Injector,
  ) {
  }

  async addComponent<Component>(A11yModule: Type<LazyA11yModule<Component>>, host: Host, preference: Preference) {
    this.viewContainerRef.clear();
    const moduleFactory = await this.compiler.compileModuleAsync(A11yModule);
    const moduleRef = moduleFactory.create(this.injector);
    const componentFactory = moduleRef.instance.resolveComponentFactory();
    const injector = Injector.create({
      providers: [{
        provide: 'host',
        useValue: host,
      }],
    });
    const componentRef = this.viewContainerRef.createComponent(componentFactory, 0, injector);
    Object.assign(componentRef.instance, preference);
    return componentRef;
  }

  removeComponent<Component>(componentRef: ComponentRef<Component>) {
    const index = this.viewContainerRef.indexOf(componentRef.hostView);
    if (index >= 0) {
      this.viewContainerRef.remove(index);
    }
    componentRef.destroy();
  }
}
